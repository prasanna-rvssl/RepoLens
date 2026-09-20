import re


def _has_any(text, terms):

    lower = text.lower()

    return any(
        term.lower() in lower
        for term in terms
    )


def generate_architecture(
    repository_name,
    analysis,
    file_contents,
):

    nodes = []
    edges = []

    def add_node(
        node_id,
        label,
        kind,
        description,
    ):

        if any(
            node["id"] == node_id
            for node in nodes
        ):
            return

        nodes.append(
            {
                "id": node_id,
                "label": label,
                "kind": kind,
                "description": description,
            }
        )

    # --------------------------------------------------
    # Repository root
    # --------------------------------------------------

    add_node(
        "repo",
        repository_name,
        "repository",
        "Repository entry point",
    )

    frameworks = analysis.get(
        "frameworks",
        [],
    )

    text = "\n".join(
        file_contents.values()
    )

    # --------------------------------------------------
    # Frontend
    # --------------------------------------------------

    frontend_frameworks = [
        "React",
        "Next.js",
        "Vue",
        "Angular",
        "Flutter",
        "React Native",
    ]

    detected_frontend = next(
        (
            framework
            for framework in frontend_frameworks
            if framework in frameworks
        ),
        None,
    )

    if detected_frontend:

        add_node(
            "frontend",
            detected_frontend,
            "frontend",
            "User-facing application layer",
        )

        edges.append(
            {
                "source": "repo",
                "target": "frontend",
                "label": "contains",
            }
        )

    # --------------------------------------------------
    # Backend
    # --------------------------------------------------

    backend_frameworks = [
        "Flask",
        "FastAPI",
        "Django",
        "Express",
        "Spring",
        "Rails",
    ]

    detected_backend = next(
        (
            framework
            for framework in backend_frameworks
            if framework in frameworks
        ),
        None,
    )

    if detected_backend:

        add_node(
            "backend",
            detected_backend,
            "backend",
            "Server/API layer",
        )

        edges.append(
            {
                "source": "repo",
                "target": "backend",
                "label": "contains",
            }
        )

    # --------------------------------------------------
    # Machine Learning
    # --------------------------------------------------

    if _has_any(
        text,
        [
            "sklearn",
            "scikit-learn",
            "tensorflow",
            "torch",
            "pytorch",
            "keras",
            "mediapipe",
        ],
    ):

        add_node(
            "ml",
            "ML / AI",
            "ai",
            "Machine-learning or AI components",
        )

        edges.append(
            {
                "source": "repo",
                "target": "ml",
                "label": "uses",
            }
        )

    # --------------------------------------------------
    # AI / Model services
    # --------------------------------------------------

    if _has_any(
        text,
        [
            "whisper",
            "openai",
            "transformers",
            "huggingface",
        ],
    ):

        add_node(
            "ai-service",
            "AI / Model",
            "ai",
            "AI model or inference component",
        )

        edges.append(
            {
                "source": "repo",
                "target": "ai-service",
                "label": "uses",
            }
        )

    # --------------------------------------------------
    # Database
    # --------------------------------------------------

    if _has_any(
        text,
        [
            "sqlalchemy",
            "psycopg",
            "pymongo",
            "mongoose",
            "mongodb",
            "postgres",
            "mysql",
            "sqlite",
        ],
    ):

        add_node(
            "data",
            "Data Layer",
            "data",
            "Database or persistence layer",
        )

        edges.append(
            {
                "source": "repo",
                "target": "data",
                "label": "uses",
            }
        )

    # --------------------------------------------------
    # Component relationships
    # --------------------------------------------------

    if (
        any(
            node["id"] == "frontend"
            for node in nodes
        )
        and
        any(
            node["id"] == "backend"
            for node in nodes
        )
    ):

        edges.append(
            {
                "source": "frontend",
                "target": "backend",
                "label": "API / requests",
            }
        )

    if (
        any(
            node["id"] == "backend"
            for node in nodes
        )
        and
        any(
            node["id"] == "ml"
            for node in nodes
        )
    ):

        edges.append(
            {
                "source": "backend",
                "target": "ml",
                "label": "invokes",
            }
        )

    if (
        any(
            node["id"] == "backend"
            for node in nodes
        )
        and
        any(
            node["id"] == "data"
            for node in nodes
        )
    ):

        edges.append(
            {
                "source": "backend",
                "target": "data",
                "label": "reads / writes",
            }
        )

    if (
        any(
            node["id"] == "backend"
            for node in nodes
        )
        and
        any(
            node["id"] == "ai-service"
            for node in nodes
        )
    ):

        edges.append(
            {
                "source": "backend",
                "target": "ai-service",
                "label": "calls",
            }
        )

    # --------------------------------------------------
    # Top-level folders/modules
    # --------------------------------------------------

    top_level = analysis.get(
        "top_level_structure",
        [],
    )

    for index, item in enumerate(
        top_level[:5]
    ):

        if item.lower() in {
            "node_modules",
            ".git",
            "__pycache__",
        }:
            continue

        clean = (
            item
            .replace("/", "_")
            .replace(".", "_")
        )

        node_id = (
            f"module-{index}-{clean}"
        )

        if len(nodes) < 8:

            add_node(
                node_id,
                item,
                "module",
                "Top-level repository module",
            )

            edges.append(
                {
                    "source": "repo",
                    "target": node_id,
                    "label": "contains",
                }
            )

    # --------------------------------------------------
    # Remove duplicate edges
    # --------------------------------------------------

    unique_edges = []
    seen = set()

    for edge in edges:

        key = (
            edge["source"],
            edge["target"],
            edge["label"],
        )

        if key not in seen:

            seen.add(key)

            unique_edges.append(
                edge
            )

    return {
        "generated": True,

        "source": "repository_evidence",

        "nodes": nodes[:10],

        "edges": unique_edges[:18],

        "frameworks": frameworks[:8],

        "note": (
            "Architecture inferred from "
            "repository structure and "
            "detected technologies."
        ),
    }