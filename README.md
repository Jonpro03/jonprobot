# jonprobot
Reddit scraper

FAQs:

    Where'd you get that data/Can I have the data? I usually include a link to the most recent result set in the comments.

    How do you get the share locker value? I divide total shares by number of CS accounts to get average shares per account. I then multiply that value times the CS Account high score (divided by 10 for MOD11). For the progress bar, I divide that value by the outstanding float to get percent complete.

    Is this DRSBOT? No

    How do you gather this data? Please see below, under Methodology.

    Do I have to do anything for my post to get added? Usually not. I download every post from r/Superstonk, r/GME, r/GMEJungle, r/wallstreetbets, r/DDintoGME, r/amcstock and r/GME_Computershare. So long as you post a ComputerShare screenshot to one of those subs, I'll pick it up. No comments, flairs, nor anything else is req'd.

    Is this DRSBOT? No

    How far back does your data set go? 9/15/21

    Do you like DRSBOT? YES! I love the idea! But more than that, I love that somebody else is doing this. Apes love to do their own due diligence and double check each other. I don't want to be the only source of data.

    Can I see the code? Yes: https://github.com/Jonpro03/jonprobot

    What is considered "a day"? UTC time 0:00 to 23:59.

    Do you check for fake posts? No. I rely on the community to identify fakes.

    Do you check for duplicates (posts to multiple subs)? Yes.

    Do you check for direct-stock purchases? Yes.

Methodology

I'm pretty confident in my results, because I did this for me, not for you. I wrote a lot of code to automate as much of this process as I could.

It is not infallible. Shortcomings include missing posts where the Ape attached multiple images, posts with super-high-resolution images, posts with pictures of monitors with visible moire patterns (this completely jacks up computervision), and I was completely unprepared for videos of refreshing the portfolio page. These are added manually, though.

Every 15 minutes, the code:

    Downloads every post from GME-related subs on reddit and throws it into a local database.

    Downloads images associated with those posts.

    Uses a computer vision library to extract the text from the images and stores it alongside the post's record in the local database.

    Runs an algorithm to do a high-level classification of the screenshot to determine if it's a one-time purchase from ComputerShare, or a screenshot of a portfolio.

I wrote a handful of scripts that:

    Pull new purchase and portfolio posts out of the main database and put it in scoped databases.

    Prompt me to review posts where computervision failed to find a value on the screenshot.

    Prompt me to review all other posts to make sure computervision got the right value.

    Reconcile duplicate posts (mostly when a user posts the same image to multiple subs).

    Give me the ability to audit any record to change the value or remove the record. (Shenanigans)

    If a portfolio screenshot just shows a dollar amount and not number of shares (this happens a lot), the code will guess the number of shares using the average price of GME for the day.

Then I wrote a script to aggregate the posts and apply the following logic to get the most accurate count of ComputerShare accounts, and number of DRS'd shares in those accounts:

    For purchase screenshots, I determine the amount of shares purchased by dividing the purchase amount by the average price of GME for the period. This is ultimately wrong, b/c purchases from ComputerShare take a few days before the price is known, but I have no other option, really.

    Multiple purchases from the same Ape (minus x-post duplicates) are added together into a single record, because they presumably end up in the same ComputerShare account.

    If an Ape posts purchase screenshots, then at a later time posts a portfolio screenshot, I zero out the purchase value since the portfolio will include the purchase, but it still counts toward the total number of ComputerShare accounts. Previously, I would just drop the purchase record(s) entirely, but then I learned that some Apes who do this end up with multiple ComputerShare account numbers. By zeroing the value, I can account for this behavior. The result is that it makes the estimate more conservative, because not all Apes observe this behavior. Nonetheless, I prefer my estimates remain conservative.

    If an ape posts multiple portfolio screenshots, I drop the lower value portfolio records and they do not count toward the total number of ComputerShare accounts.


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

# 4_compile_drs.py
Apply logic and build a results_db with total shares. This must be recreated every day to correctly recalculate when users post updates.

# 5_ape_metrics.py
data science stuffs

