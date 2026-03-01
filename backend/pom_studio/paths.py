from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
POM_WORKSPACE_DIR = BACKEND_DIR / "pom_workspace"


def get_pom_workspace_dir() -> str:
    """Return the local workspace used by Playwright POM studio."""
    return str(POM_WORKSPACE_DIR)


def ensure_pom_workspace() -> str:
    """Create the workspace tree expected by POM routers."""
    required_dirs = [
        "tests",
        "pages",
        "locators",
        "data",
        "base",
        "utils",
        "recordings",
        "generated_pom/tests",
        "generated_pom/pages",
        "generated_pom/locators",
        "generated_pom/data",
        "tools",
        "reports",
        "flows",
    ]
    for rel in required_dirs:
        (POM_WORKSPACE_DIR / rel).mkdir(parents=True, exist_ok=True)

    seed_files = {
        "tools/raw_recorded.py": "from playwright.sync_api import Playwright\n\n\ndef run(playwright: Playwright) -> None:\n    pass\n",
        "base/base_page.py": "from contextlib import contextmanager\n\n\nclass BasePage:\n    def __init__(self, page):\n        self.page = page\n\n    def navigate_to(self, url: str):\n        self.page.goto(url)\n\n    def click(self, selector: str):\n        self.page.locator(selector).click()\n\n    def type_text(self, selector: str, text: str, clear_first: bool = False):\n        locator = self.page.locator(selector)\n        if clear_first:\n            locator.clear()\n        locator.fill(text)\n\n    def verify_element_visible(self, selector: str):\n        self.page.locator(selector).wait_for(state=\"visible\")\n\n    def verify_element_text(self, selector: str, expected_text: str):\n        value = self.page.locator(selector).inner_text()\n        assert expected_text in value\n\n    def verify_url(self, expected_url: str):\n        assert expected_url in self.page.url\n\n    def handle_alert(self, action: str = \"accept\"):\n        def _handler(dialog):\n            if action == \"dismiss\":\n                dialog.dismiss()\n            else:\n                dialog.accept()\n\n        self.page.once(\"dialog\", _handler)\n\n    @contextmanager\n    def handle_popup(self):\n        with self.page.expect_popup() as popup_info:\n            yield popup_info\n",
        "flows/shared_flows.py": "from base.base_page import BasePage\n\n\nclass SharedFlows(BasePage):\n    \"\"\"Reusable cross-test flows.\"\"\"\n\n    pass\n",
        "locators/shared_locators.py": "class SharedLocators:\n    \"\"\"Shared locators for reusable flows.\"\"\"\n\n    pass\n",
        "data/shared_data.json": "{}\n",
        "utils/json_util.py": "import json\n\n\nclass JsonUtil:\n    @staticmethod\n    def read_json(path: str):\n        with open(path, \"r\", encoding=\"utf-8\") as handle:\n            return json.load(handle)\n",
    }
    for rel, content in seed_files.items():
        target = POM_WORKSPACE_DIR / rel
        if not target.exists():
            target.write_text(content, encoding="utf-8")

    return str(POM_WORKSPACE_DIR)
