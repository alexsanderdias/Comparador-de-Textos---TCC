import os
from dataclasses import dataclass
from functools import lru_cache


def _parse_csv_env(name: str, default: str) -> tuple[str, ...]:
    raw_value = os.getenv(name, default)
    return tuple(item.strip() for item in raw_value.split(",") if item.strip())


def _parse_positive_int_env(name: str, default: int) -> int:
    raw_value = os.getenv(name, str(default)).strip()
    try:
        parsed_value = int(raw_value)
    except ValueError as exc:
        raise ValueError(
            f"A variável de ambiente '{name}' deve ser um número inteiro."
        ) from exc

    if parsed_value <= 0:
        raise ValueError(
            f"A variável de ambiente '{name}' deve ser maior que zero."
        )

    return parsed_value


@dataclass(frozen=True)
class Settings:
    project_name: str
    api_prefix: str
    max_file_size_mb: int
    allowed_extensions: tuple[str, ...]
    cors_origins: tuple[str, ...]

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings(
        project_name=os.getenv("PROJECT_NAME", "Analise Textual TCC"),
        api_prefix=os.getenv("API_PREFIX", "/api/v1"),
        max_file_size_mb=_parse_positive_int_env("MAX_FILE_SIZE_MB", 10),
        allowed_extensions=tuple(
            extension.lower()
            for extension in _parse_csv_env(
                "ALLOWED_EXTENSIONS",
                ".txt,.pdf,.docx",
            )
        ),
        cors_origins=tuple(
            origin.rstrip("/")
            for origin in _parse_csv_env(
                "BACKEND_CORS_ORIGINS",
                "http://localhost:5173,http://127.0.0.1:5173",
            )
        ),
    )
