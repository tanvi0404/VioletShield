from playwright.sync_api import sync_playwright
import time



def check_browser_cookies(url):


    cookies_result = []


    with sync_playwright() as p:


        browser = p.chromium.launch(
            headless=True
        )


        context = browser.new_context(
            user_agent=
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        )


        page = context.new_page()



        try:


            print(
                "Opening:",
                url
            )


            page.goto(
                url,
                timeout=8000,
                wait_until="domcontentloaded"
            )

            # wait for JS cookies
            time.sleep(1)




            cookies = context.cookies()



            print(
                "PLAYWRIGHT COOKIE COUNT:",
                len(cookies)
            )



            for cookie in cookies:


                cookies_result.append({

                    "name":
                    cookie.get(
                        "name"
                    ),


                    "value":
                    cookie.get(
                        "value"
                    ),


                    "domain":
                    cookie.get(
                        "domain"
                    ),


                    "secure":
                    cookie.get(
                        "secure",
                        False
                    ),


                    "httpOnly":
                    cookie.get(
                        "httpOnly",
                        False
                    ),


                    "sameSite":
                    cookie.get(
                        "sameSite",
                        "None"
                    )


                })



        except Exception as e:


            print(
                "Browser Cookie Error:",
                e
            )



        finally:


            browser.close()



    return cookies_result