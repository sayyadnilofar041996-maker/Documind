from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Any
import os

# Create a temporary .env file for testing
with open("test.env", "w") as f:
    f.write("ALLOWED_EXTENSIONS=pdf,docx,py,js,ts,md\n")

class MinimalSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="test.env",
        env_parse_list_separator=","
    )
    allowed_extensions: List[str]

try:
    s = MinimalSettings()
    print(f"SUCCESS: {s.allowed_extensions}")
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()

# Try without separator
class MinimalSettingsNoSep(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="test.env"
    )
    allowed_extensions: List[str]

try:
    s = MinimalSettingsNoSep()
    print(f"SUCCESS (No Sep): {s.allowed_extensions}")
except Exception as e:
    print(f"FAILED (No Sep): {e}")

# Try with Any
class MinimalSettingsAny(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="test.env"
    )
    allowed_extensions: Any

# Try with Any + Validator
from pydantic import field_validator

class MinimalSettingsAnyValidator(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="test.env"
    )
    allowed_extensions: Any

    @field_validator("allowed_extensions", mode="after")
    @classmethod
    def validate_extensions(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            return [ext.strip() for ext in v.split(",") if ext.strip()]
        return v

try:
    s = MinimalSettingsAnyValidator()
    print(f"SUCCESS (Any+Val): {s.allowed_extensions} (Type: {type(s.allowed_extensions)})")
except Exception as e:
    print(f"FAILED (Any+Val): {e}")

os.remove("test.env")
