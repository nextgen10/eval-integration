from contextlib import contextmanager


class BasePage:
    def __init__(self, page):
        self.page = page

    def navigate_to(self, url: str):
        self.page.goto(url)

    def click(self, selector: str):
        self.page.locator(selector).click()

    def type_text(self, selector: str, text: str, clear_first: bool = False):
        locator = self.page.locator(selector)
        if clear_first:
            locator.clear()
        locator.fill(text)

    def verify_element_visible(self, selector: str):
        self.page.locator(selector).wait_for(state="visible")

    def verify_element_text(self, selector: str, expected_text: str):
        value = self.page.locator(selector).inner_text()
        assert expected_text in value

    def verify_url(self, expected_url: str):
        assert expected_url in self.page.url

    def handle_alert(self, action: str = "accept"):
        def _handler(dialog):
            if action == "dismiss":
                dialog.dismiss()
            else:
                dialog.accept()

        self.page.once("dialog", _handler)

    @contextmanager
    def handle_popup(self):
        with self.page.expect_popup() as popup_info:
            yield popup_info
