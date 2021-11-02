from typing import List

class PortfolioPost:

    def __init__(self):
        self.u: str = ""
        self.id: str = ""
        self.sub: str = ""
        self.url: str = ""
        self.created: int = 0
        self.audited: bool = False


class PurchasePost:

    def __init__(self):
        self.u



class CS_Account:

    def __init__(self):
        self.u = ""
        self.portfolio_posts: List[PortfolioPost] = []


if __name__ == "__main__":
    csa = CS_Account()
    csa.portfolio_posts.append(1)
    print(csa)