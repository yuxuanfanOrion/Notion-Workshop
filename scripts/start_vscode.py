from __future__ import annotations

import os
import subprocess
import sys
import time


def main() -> None:
    host = os.getenv("HOST", "127.0.0.1")
    port = os.getenv("PORT", "8000")
    url = f"http://{host}:{port}"

    uvicorn_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        host,
        "--port",
        str(port),
    ]

    server = subprocess.Popen(uvicorn_cmd)
    time.sleep(1.0)

    code_cmd = [
        "code",
        "--command",
        "simpleBrowser.show",
        "--args",
        url,
    ]

    try:
        subprocess.run(code_cmd, check=False)
    except FileNotFoundError:
        print("未找到 VS Code CLI（code），请先安装并配置到 PATH。")

    server.wait()


if __name__ == "__main__":
    main()
