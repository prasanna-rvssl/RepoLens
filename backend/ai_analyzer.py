import json
import os
import re

import requests


def _fallback(repository, analysis, file_contents):
    """
    Generates a useful non-LLM summary when no OpenAI API key
    is configured.

    SUMMARY:
    Explains what the project does and how it works.

    KEY OBSERVATIONS:
    Lists concrete findings discovered from the repository.
    """

    repo_name = repository.get("name") or "This repository"

    description = repository.get("description")

    languages = [
        item["name"]
        for item in analysis.get("languages", [])[:5]
    ]

    frameworks = analysis.get(
        "frameworks",
        []
    )[:5]

    dependencies = analysis.get(
        "dependencies",
        []
    )

    tests = analysis.get(
        "tests",
        {}
    )

    readme = analysis.get(
        "documentation",
        {}
    ).get(
        "readme",
        False
    )

    top_level = analysis.get(
        "top_level_structure",
        []
    )

    # ==================================================
    # PROJECT DESCRIPTION
    # ==================================================

    if description:
        project_intro = (
            f"{repo_name} is "
            f"{description.strip().rstrip('.')}"
        )
    else:

        language_text = (
            ", ".join(languages)
            if languages
            else "software"
        )

        project_intro = (
            f"{repo_name} is a software project "
            f"primarily implemented using "
            f"{language_text}"
        )

    # ==================================================
    # DETECT APPLICATION TYPE
    # ==================================================

    frontend_frameworks = {
        "React",
        "Next.js",
        "Vue",
        "Angular",
        "Flutter",
        "React Native",
    }

    backend_frameworks = {
        "Flask",
        "FastAPI",
        "Django",
        "Express",
        "Spring",
        "Rails",
    }

    detected_frontend = [
        framework
        for framework in frameworks
        if framework in frontend_frameworks
    ]

    detected_backend = [
        framework
        for framework in frameworks
        if framework in backend_frameworks
    ]

    # ==================================================
    # AI SUMMARY
    # ==================================================

    summary = []

    # Line 1 — What the project is
    summary.append(
        f"{project_intro}."
    )

    # Line 2 — Main application architecture
    if detected_frontend and detected_backend:

        summary.append(
            f"The repository follows a full-stack structure, "
            f"with {detected_frontend[0]} providing the "
            f"user-facing application and "
            f"{detected_backend[0]} handling server-side "
            f"or API functionality."
        )

    elif detected_frontend:

        summary.append(
            f"The project is centered around a "
            f"{detected_frontend[0]} application, "
            f"with the repository structure supporting "
            f"its user interface and application logic."
        )

    elif detected_backend:

        summary.append(
            f"The project is centered around a "
            f"{detected_backend[0]} backend, where the "
            f"repository structure supports server-side "
            f"processing and API functionality."
        )

    elif frameworks:

        summary.append(
            f"The codebase is built around "
            f"{frameworks[0]}, with its source modules "
            f"and supporting configuration organized "
            f"within the repository."
        )

    else:

        summary.append(
            "The codebase is organized around its main "
            "source modules and supporting project "
            "configuration."
        )

    # Line 3 — Repository organization
    useful_folders = [
        item
        for item in top_level
        if item.lower() not in {
            ".git",
            "node_modules",
            "__pycache__",
        }
    ][:4]

    if useful_folders:

        folder_text = ", ".join(
            f"`{item}`"
            for item in useful_folders
        )

        summary.append(
            f"The implementation is separated across "
            f"top-level areas such as {folder_text}, "
            f"which keeps the major parts of the project "
            f"organized into distinct sections."
        )

    else:

        summary.append(
            "The repository uses a compact structure in "
            "which the main implementation and supporting "
            "resources are kept within a small set of "
            "project modules."
        )

    # Line 4 — Component interaction
    if detected_frontend and detected_backend:

        summary.append(
            "The frontend and backend operate as separate "
            "application layers, allowing user interactions "
            "to be handled by the interface while processing "
            "and application logic remain on the server side."
        )

    elif detected_backend:

        summary.append(
            "The main application flow is centered around "
            "server-side processing, with the backend "
            "providing the functionality through its "
            "application modules and interfaces."
        )

    elif detected_frontend:

        summary.append(
            "The main application flow is centered around "
            "the user-facing layer, with the frontend "
            "components coordinating the application's "
            "interface and client-side behavior."
        )

    else:

        summary.append(
            "The main application flow can be understood "
            "by following the relationships between the "
            "repository's core source modules."
        )

    # Line 5 — Overall understanding
    summary.append(
        "Overall, the repository can be understood by "
        "following how its core application components "
        "connect with the supporting modules and project "
        "configuration."
    )

    # Exactly 5 summary lines
    summary = summary[:5]

    # ==================================================
    # KEY OBSERVATIONS
    #
    # These are concrete scanner findings.
    # They intentionally do NOT explain the project.
    # ==================================================

    observations = []

    # Observation 1 — Primary language
    if languages:

        observations.append(
            f"Primary language detected: "
            f"{languages[0]}."
        )

    else:

        observations.append(
            "No primary programming language "
            "was detected."
        )

    # Observation 2 — Frameworks
    if frameworks:

        observations.append(
            "Frameworks/libraries detected: "
            + ", ".join(frameworks)
            + "."
        )

    else:

        observations.append(
            "No supported application framework "
            "was detected."
        )

    # Observation 3 — Tests
    if tests.get("detected"):

        observations.append(
            f"{tests.get('count', 0)} "
            f"test-related files were detected."
        )

    else:

        observations.append(
            "No test-related files were detected "
            "by the repository scanner."
        )

    # Observation 4 — Dependencies
    if dependencies:

        dependency_names = [
            item["file"]
            for item in dependencies[:4]
        ]

        observations.append(
            "Dependency/configuration files detected: "
            + ", ".join(dependency_names)
            + "."
        )

    else:

        observations.append(
            "No recognized dependency or "
            "configuration files were detected."
        )

    # Observation 5 — Documentation
    if readme:

        observations.append(
            "Repository documentation was detected "
            "through a README file."
        )

    else:

        observations.append(
            "No README documentation was detected."
        )

    # Exactly 5 observations
    observations = observations[:5]

    return {
        "summary": summary,
        "key_observations": observations,
        "source": "heuristic_fallback",
    }


def _extract_json(text):

    text = text.strip()

    # Remove Markdown JSON fences if the model returns them
    if text.startswith("```"):

        text = re.sub(
            r"^```(?:json)?",
            "",
            text,
            flags=re.IGNORECASE,
        ).strip()

        text = re.sub(
            r"```$",
            "",
            text,
        ).strip()

    try:

        return json.loads(text)

    except json.JSONDecodeError:

        match = re.search(
            r"\{.*\}",
            text,
            flags=re.DOTALL,
        )

        if match:

            return json.loads(
                match.group(0)
            )

    raise ValueError(
        "AI response was not valid JSON."
    )


def generate_ai_analysis(
    repository,
    analysis,
    file_contents,
):

    api_key = os.getenv(
        "OPENAI_API_KEY"
    )

    # Always prepare a fallback.
    fallback = _fallback(
        repository,
        analysis,
        file_contents,
    )

    # ==================================================
    # NO API KEY
    # ==================================================

    if not api_key:
        return fallback

    model = os.getenv(
        "OPENAI_MODEL",
        "gpt-5.6-luna",
    )

    # ==================================================
    # PREPARE REPOSITORY EVIDENCE
    # ==================================================

    evidence_files = []

    for path, content in list(
        file_contents.items()
    )[:15]:

        evidence_files.append(
            f"\n--- {path} ---\n"
            f"{content[:12000]}"
        )

    # ==================================================
    # AI PROMPT
    # ==================================================

    prompt = f"""
You are RepoLens, a developer tool that explains
unfamiliar GitHub repositories.

You must produce TWO DISTINCT sections:

==================================================
SECTION 1 — SUMMARY
==================================================

Write exactly FIVE sentences.

The summary should help a developer understand
the repository without opening the code.

Explain:

1. What the project is or does.
2. Its overall purpose.
3. How its major components are organized.
4. How important components interact.
5. The overall architecture or workflow.

The summary must be a conceptual explanation.

DO NOT use the summary to list scanner statistics.

Do NOT mention:
- number of files
- number of tests
- number of dependencies
- "Python is the primary language"
- "README exists"
- simple counts
- raw scanner results

Only mention a technology when it helps explain
the actual role of that technology in the project.

==================================================
SECTION 2 — KEY OBSERVATIONS
==================================================

Write exactly FIVE observations.

These must be concrete findings discovered
from the repository.

Good observations include:

- detected programming languages
- detected frameworks
- important configuration files
- dependency files
- testing indicators
- documentation indicators
- notable repository structure

The observations should be short and factual.

==================================================
IMPORTANT DIFFERENCE
==================================================

SUMMARY = Explain the project.

KEY OBSERVATIONS = Report what RepoLens found.

Do NOT repeat the same information in both sections.

For example:

BAD:

Summary:
"The project uses Python."

Observation:
"Python is the primary language."

GOOD:

Summary:
"The project uses a Python-based backend to
process requests and provide application logic."

Observation:
"Python was detected as the primary language."

The summary should answer:

"What would I need to understand about this
project if I had never seen it before?"

The observations should answer:

"What concrete evidence did RepoLens discover?"

==================================================
REPOSITORY EVIDENCE
==================================================

Repository metadata:
{json.dumps(repository, indent=2)}

Repository scanner analysis:
{json.dumps(analysis, indent=2)}

Selected repository files:
{"".join(evidence_files)}

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{{
  "summary": [
    "sentence 1",
    "sentence 2",
    "sentence 3",
    "sentence 4",
    "sentence 5"
  ],
  "key_observations": [
    "observation 1",
    "observation 2",
    "observation 3",
    "observation 4",
    "observation 5"
  ]
}}

STRICT RULES:

1. Exactly 5 summary sentences.
2. Exactly 5 key observations.
3. Summary must be conceptual.
4. Key observations must be factual.
5. Avoid repeating information between sections.
6. Do not invent technologies or functionality.
7. Only use evidence supplied above.
8. Make the summary specific to THIS repository.
9. Avoid generic descriptions that could apply
   to any software project.
10. Keep observations concise.
"""

    # ==================================================
    # CALL OPENAI
    # ==================================================

    try:

        response = requests.post(
            "https://api.openai.com/v1/responses",

            headers={
                "Authorization": (
                    f"Bearer {api_key}"
                ),
                "Content-Type": (
                    "application/json"
                ),
            },

            json={
                "model": model,

                "input": prompt,

                "text": {
                    "format": {
                        "type": "json_object"
                    }
                },

                "store": False,
            },

            timeout=60,
        )

        response.raise_for_status()

        payload = response.json()

        # Try the convenient output_text field first
        text = payload.get(
            "output_text",
            "",
        )

        # Fallback for normal Responses API structure
        if not text:

            chunks = []

            for item in payload.get(
                "output",
                [],
            ):

                for content in item.get(
                    "content",
                    [],
                ):

                    if content.get(
                        "type"
                    ) == "output_text":

                        chunks.append(
                            content.get(
                                "text",
                                "",
                            )
                        )

            text = "".join(chunks)

        # Parse JSON
        result = _extract_json(
            text
        )

        summary = result.get(
            "summary",
            [],
        )

        observations = result.get(
            "key_observations",
            [],
        )

        # ==================================================
        # VALIDATE TYPES
        # ==================================================

        if not isinstance(
            summary,
            list,
        ):

            raise ValueError(
                "summary must be a list"
            )

        if not isinstance(
            observations,
            list,
        ):

            raise ValueError(
                "key_observations must be a list"
            )

        # ==================================================
        # CLEAN OUTPUT
        # ==================================================

        summary = [
            str(item).strip()
            for item in summary
            if str(item).strip()
        ][:5]

        observations = [
            str(item).strip()
            for item in observations
            if str(item).strip()
        ][:5]

        # ==================================================
        # VALIDATE EXACT LENGTH
        # ==================================================

        if (
            len(summary) != 5
            or len(observations) != 5
        ):

            raise ValueError(
                "AI response must contain "
                "exactly 5 summary sentences "
                "and 5 key observations."
            )

        # ==================================================
        # RETURN AI RESULT
        # ==================================================

        return {
            "summary": summary,
            "key_observations": observations,
            "source": "openai",
            "model": model,
        }

    except Exception as exc:

        # If AI fails, RepoLens still works.
        fallback["source"] = (
            "heuristic_fallback"
        )

        fallback["ai_error"] = str(
            exc
        )

        return fallback