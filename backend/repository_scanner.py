import os
from collections import Counter


LANGUAGE_BY_EXTENSION = {
    ".py": "Python",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".java": "Java",
    ".go": "Go",
    ".rs": "Rust",
    ".dart": "Dart",
    ".cpp": "C++",
    ".cc": "C++",
    ".c": "C",
    ".cs": "C#",
    ".php": "PHP",
    ".rb": "Ruby",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".sql": "SQL",
}


FRAMEWORK_RULES = [
    ("React", ["react", "react-dom"]),
    ("Next.js", ["next"]),
    ("Vue", ["vue"]),
    ("Angular", ["@angular/core"]),
    ("Flask", ["flask"]),
    ("FastAPI", ["fastapi"]),
    ("Django", ["django"]),
    ("Express", ["express"]),
    ("Flutter", ["flutter"]),
    ("React Native", ["react-native"]),
    ("Spring", ["springframework"]),
    ("Rails", ["rails"]),
    ("Streamlit", ["streamlit"]),
]


DEPENDENCY_FILES = {
    "requirements.txt": "Python dependencies",
    "pyproject.toml": "Python project configuration",
    "package.json": "Node.js dependencies",
    "package-lock.json": "npm dependency lock file",
    "yarn.lock": "Yarn dependency lock file",
    "pnpm-lock.yaml": "pnpm dependency lock file",
    "Cargo.toml": "Rust project configuration",
    "go.mod": "Go dependencies",
    "pom.xml": "Maven project configuration",
    "build.gradle": "Gradle project configuration",
    "pubspec.yaml": "Flutter/Dart dependencies",
    "Dockerfile": "Container configuration",
    "docker-compose.yml": "Container orchestration",
    "docker-compose.yaml": "Container orchestration",
}


def _language_counts(files):
    counts = Counter()

    for file in files:
        path = file.get("path", "")
        name = path.rsplit("/", 1)[-1]

        if name in {
            "Dockerfile",
            "Makefile",
        }:
            continue

        ext = os.path.splitext(name)[1].lower()

        language = LANGUAGE_BY_EXTENSION.get(ext)

        if language:
            counts[language] += 1

    return [
        {
            "name": name,
            "files": count,
        }
        for name, count in counts.most_common()
    ]


def _frameworks(contents):
    text = "\n".join(
        contents.values()
    ).lower()

    found = []

    for framework, signatures in FRAMEWORK_RULES:
        if any(
            signature.lower() in text
            for signature in signatures
        ):
            found.append(framework)

    return found


def _important_files(files):
    important_names = {
        "README.md",
        "README",
        "package.json",
        "requirements.txt",
        "pyproject.toml",
        "Cargo.toml",
        "go.mod",
        "pom.xml",
        "pubspec.yaml",
        "Dockerfile",
        "docker-compose.yml",
        "docker-compose.yaml",
        ".env.example",
        ".gitignore",
    }

    result = []

    for file in files:
        name = file.get(
            "path",
            "",
        ).rsplit(
            "/",
            1,
        )[-1]

        if name in important_names:
            result.append(
                file["path"]
            )

    return result[:30]


def _dependencies(files):
    result = []

    for file in files:
        path = file.get(
            "path",
            "",
        )

        name = path.rsplit(
            "/",
            1,
        )[-1]

        if name in DEPENDENCY_FILES:
            result.append(
                {
                    "file": path,
                    "purpose": DEPENDENCY_FILES[name],
                }
            )

    return result[:50]


def _tests(files):
    test_files = []

    for file in files:
        path = file.get(
            "path",
            "",
        ).lower()

        name = path.rsplit(
            "/",
            1,
        )[-1]

        if (
            "/test" in f"/{path}"
            or name.startswith("test_")
            or name.endswith("_test.py")
            or ".test." in name
            or ".spec." in name
        ):
            test_files.append(
                file["path"]
            )

    return {
        "detected": bool(test_files),
        "count": len(test_files),
        "files": test_files[:50],
    }


def _top_level_structure(files):
    result = set()

    for file in files:
        path = file.get(
            "path",
            "",
        )

        if not path:
            continue

        first = path.split("/")[0]

        result.add(first)

    return sorted(
        result,
        key=str.lower,
    )[:40]


def _readme(contents):
    for path, content in contents.items():

        filename = path.rsplit(
            "/",
            1,
        )[-1].lower()

        if filename in {
            "readme.md",
            "readme",
        }:
            return {
                "detected": True,
                "path": path,
                "preview": content[:5000],
            }

    return {
        "detected": False,
        "path": None,
        "preview": "",
    }


def analyze_repository(
    files,
    contents=None,
):
    contents = contents or {}

    readme = _readme(contents)

    return {
        "languages": _language_counts(files),

        "frameworks": _frameworks(
            contents
        ),

        "important_files": _important_files(
            files
        ),

        "dependencies": _dependencies(
            files
        ),

        "tests": _tests(files),

        "documentation": {
            "readme": readme["detected"],
            "path": readme["path"],
        },

        "top_level_structure": _top_level_structure(
            files
        ),

        "total_files": len(files),

        "source_files_analyzed": len(
            contents
        ),
    }