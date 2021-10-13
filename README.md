# jonprobot
Reddit scraper

# UpdatePosts.py
Runs on a 15m interval
Scrapes data from various subreddits
Identifies and downloads image-only posts
Uses computervision to extract the text from the image
Classifies the post based on the text in the image as a portfolio, receipt, or drs purchase

# 1_load_focused_dbs.py
Creates new_shares_db and portfolio_db based on previous classification
Attempts to extract share count/purchase amount

# 2_audit_portfolios.py
Identifies duplicates
Prompts user to review computervision failures
Prompts user to review all posts for accuracy
Allows user to change a db record

# 3_audit_purchases.py
Identifies duplicates
Prompts user to review computervision failures
Prompts user to review all posts for accuracy
Allows user to change a db record

4_compile_drs.py
For purchase screenshots, I determine the amount of shares purchased by dividing the purchase amount by the average price of GME for the period. This is ultimately wrong, b/c purchases from ComputerShare take a few days before the price is known, but I have no other option, really.
Multiple purchases from the same Ape (minus x-post duplicates) are added together into a single record, because they presumably end up in the same ComputerShare account.
If an Ape posts purchase screenshots, then at a later time posts a portfolio screenshot, I zero out the purchase value since the portfolio will include the purchase, but it still counts toward the total number of ComputerShare accounts. NOTE: this is a change from last week. Previously, I would just drop the purchase record(s) entirely, but then I learned that some Apes who do this end up with multiple ComputerShare account numbers. By zeroing the value, I can account for this behavior. The result is that it makes the estimate more conservative, because not all Apes observe this behavior. Nonetheless, I prefer my estimates remain conservative.
If an ape posts multiple portfolio screenshots, I drop the lower value portfolio records and they do not count toward the total number of ComputerShare accounts.

5_ape_metrics.py
data science stuffs
