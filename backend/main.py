import os
import re
import base64
from urllib.parse import urlparse

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

from repository_scanner import analyze_repository
from ai_analyzer import generate_ai_analysis
from architecture_analyzer import generate_architecture

load_dotenv()

app = FastAPI(
    title="RepoLens API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://repo-lens-mauve.vercel.app",
        "https://repo-lens-aonb71e9x-prasanna-rvssl.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GITHUB_API = "https://api.github.com"


class AnalyzeRequest(BaseModel):
    github_url: HttpUrl


# =========================================================
# GITHUB HELPERS
# =========================================================

def parse_github_url(url: str):
    parsed = urlparse(str(url))

    if parsed.netloc.lower() not in {
        "github.com",
        "www.github.com",
    }:
        raise HTTPException(
            status_code=400,
            detail="Please enter a public GitHub repository URL.",
        )

    parts = [
        part
        for part in parsed.path.strip("/").split("/")
        if part
    ]

    if len(parts) < 2:
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub repository URL.",
        )

    owner = parts[0]
    repo = parts[1].removesuffix(".git")

    if not re.fullmatch(
        r"[A-Za-z0-9_.-]+",
        owner
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub owner name.",
        )

    if not re.fullmatch(
        r"[A-Za-z0-9_.-]+",
        repo
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub repository name.",
        )

    return owner, repo


def github_headers():

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "RepoLens",
    }

    # Optional token.
    # Demo users DO NOT need one.
    token = os.getenv("GITHUB_TOKEN")

    if token:
        headers["Authorization"] = f"Bearer {token}"

    return headers


def github_get(path: str, params=None):

    try:

        response = requests.get(
            f"{GITHUB_API}{path}",
            headers=github_headers(),
            params=params,
            timeout=20,
        )

    except requests.RequestException as exc:

        raise HTTPException(
            status_code=502,
            detail=f"Unable to connect to GitHub: {exc}",
        )

    if response.status_code == 404:

        raise HTTPException(
            status_code=404,
            detail=(
                "GitHub repository not found "
                "or the repository is not public."
            ),
        )

    if response.status_code == 403:

        raise HTTPException(
            status_code=429,
            detail=(
                "GitHub API rate limit reached. "
                "Please try again later."
            ),
        )

    if not response.ok:

        raise HTTPException(
            status_code=502,
            detail=(
                f"GitHub API error "
                f"({response.status_code})."
            ),
        )

    return response.json()


# =========================================================
# FILE SELECTION
# =========================================================

IMPORTANT_FILE_NAMES = {
    "README.md",
    "README",
    "pyproject.toml",
    "requirements.txt",
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "Cargo.toml",
    "go.mod",
    "pom.xml",
    "build.gradle",
    "pubspec.yaml",
    "Dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
}


CODE_EXTENSIONS = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".java",
    ".go",
    ".rs",
    ".dart",
    ".cpp",
    ".c",
    ".cs",
    ".php",
    ".rb",
}


def is_code_file(path):

    name = path.rsplit(
        "/",
        1
    )[-1]

    if "." not in name:
        return False

    extension = (
        "."
        + name.rsplit(
            ".",
            1
        )[-1].lower()
    )

    return extension in CODE_EXTENSIONS


def select_useful_files(files):

    important = []
    code_files = []

    for file in files:

        path = file["path"]

        name = path.rsplit(
            "/",
            1
        )[-1]

        if name in IMPORTANT_FILE_NAMES:

            important.append(path)

        elif is_code_file(path):

            code_files.append(path)

    # Remove duplicates while preserving order
    important = list(
        dict.fromkeys(important)
    )

    code_files = list(
        dict.fromkeys(code_files)
    )

    # Important configuration/documentation files
    # are more valuable than random source files.
    selected = important[:8]

    # Only a small number of source files.
    selected += code_files[:7]

    return list(
        dict.fromkeys(selected)
    )


# =========================================================
# FETCH REPOSITORY
# =========================================================

def fetch_repository(owner, repo):

    # -----------------------------------------------------
    # REQUEST 1
    # Repository metadata
    # -----------------------------------------------------

    metadata = github_get(
        f"/repos/{owner}/{repo}"
    )

    default_branch = metadata.get(
        "default_branch",
        "main"
    )

    # -----------------------------------------------------
    # REQUEST 2
    # Entire repository tree
    #
    # This gives us all paths without downloading
    # every file.
    # -----------------------------------------------------

    tree_response = github_get(
        f"/repos/{owner}/{repo}/git/trees/{default_branch}",
        params={
            "recursive": "1"
        },
    )

    tree = tree_response.get(
        "tree",
        []
    )

    files = []

    for item in tree:

        if item.get("type") != "blob":
            continue

        path = item.get(
            "path",
            ""
        )

        if not path:
            continue

        files.append(
            {
                "path": path,
                "type": "file",
                "size": item.get(
                    "size",
                    0
                ),
            }
        )

    # -----------------------------------------------------
    # Select only useful files
    # -----------------------------------------------------

    selected_files = select_useful_files(
        files
    )

    contents = {}

    # -----------------------------------------------------
    # REQUESTS 3+
    #
    # Fetch only a SMALL number of files.
    # Maximum ~15 content requests.
    # -----------------------------------------------------

    for path in selected_files:

        try:

            content_response = github_get(
                f"/repos/{owner}/{repo}/contents/{path}"
            )

            if (
                content_response.get(
                    "encoding"
                )
                == "base64"
            ):

                encoded = (
                    content_response.get(
                        "content",
                        ""
                    )
                    .replace(
                        "\n",
                        ""
                    )
                )

                raw = base64.b64decode(
                    encoded
                ).decode(
                    "utf-8",
                    errors="ignore",
                )

                # Prevent extremely large files
                # from overwhelming the AI request.
                contents[path] = raw[:20000]

        except HTTPException:

            # One problematic file should not
            # break the entire repository analysis.
            continue

        except Exception:

            continue

    return (
        metadata,
        files,
        contents,
    )


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "name": "RepoLens API",
        "status": "running",
    }


# =========================================================
# ANALYZE REPOSITORY
# =========================================================

@app.post("/analyze")
def analyze(
    request: AnalyzeRequest
):

    # -----------------------------------------------------
    # Parse GitHub URL
    # -----------------------------------------------------

    owner, repo = parse_github_url(
        str(request.github_url)
    )

    # -----------------------------------------------------
    # Fetch repository
    # -----------------------------------------------------

    metadata, files, contents = fetch_repository(
        owner,
        repo
    )

    # -----------------------------------------------------
    # Repository scanner
    # -----------------------------------------------------

    analysis = analyze_repository(
        files,
        contents
    )

    # -----------------------------------------------------
    # AI summary + key observations
    # -----------------------------------------------------

    ai_analysis = generate_ai_analysis(
        repository={
            "name": metadata.get(
                "name"
            ),
            "full_name": metadata.get(
                "full_name"
            ),
            "description": metadata.get(
                "description"
            ),
            "language": metadata.get(
                "language"
            ),
        },

        analysis=analysis,

        file_contents=contents,
    )

    # -----------------------------------------------------
    # RepoMap / architecture
    # -----------------------------------------------------

    architecture = generate_architecture(
        repository_name=metadata.get(
            "name",
            repo
        ),

        analysis=analysis,

        file_contents=contents,
    )

    # -----------------------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------------------

    return {

        "repository": {

            "name": metadata.get(
                "name"
            ),

            "full_name": metadata.get(
                "full_name"
            ),

            "description": metadata.get(
                "description"
            ),

            "default_branch": metadata.get(
                "default_branch"
            ),

            "stars": metadata.get(
                "stargazers_count",
                0
            ),

            "forks": metadata.get(
                "forks_count",
                0
            ),

            "language": metadata.get(
                "language"
            ),

            "html_url": metadata.get(
                "html_url"
            ),
        },

        "analysis": analysis,

        "ai_analysis": ai_analysis,

        "architecture": architecture,

        "files": files,
    }