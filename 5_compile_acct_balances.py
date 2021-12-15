import tinydb
from tinydb.middlewares import CachingMiddleware
from tinydb.storages import JSONStorage
from datetime import datetime, timedelta
import pytz
import calendar as cal
import multiprocessing

today = (datetime.utcnow() - timedelta(days=1)).replace(hour=23, minute=59, second=59, tzinfo=pytz.utc)

def get_account_balances(start, end):
    account_totals = []
    s = cal.timegm(start.utctimetuple())
    e = cal.timegm(end.utctimetuple())

    db = tinydb.TinyDB("results_db_new.json", storage=CachingMiddleware(JSONStorage))
    q = tinydb.Query()
    r = db.search((q.time > s) & (q.time <= e))
    apes = list(set([p['u'] for p in r]))

    processed = 0
    pct_complete = 0
    for ape in apes:
        apes_posts = db.search((q.u == ape) & (q.time < e))
        apes_accounts = max([p["accounts"] for p in apes_posts])
        apes_total = sum([p["delta_value"] for p in apes_posts])
        # Might change this later.
        # Store the average of each Apes accounts
        for i in range(0, apes_accounts):
            account_totals.append((ape, apes_total / apes_accounts))
        processed += 1
        if pct_complete != int((processed/len(apes)) * 100):
            pct_complete = int((processed/len(apes)) * 100)
            print(f"{end} {pct_complete}%\r")
    with open(f"aws_upload/account_balances/{end.strftime('%Y-%m-%d')}.csv", 'w+') as f:
        for total in account_totals:
            f.write(f"{total[0]},{round(total[1], 2)}\n")
    return account_totals

if __name__ == "__main__":
    # build account history
    data_start = datetime(2021, 9, 12, 0, 0, tzinfo=pytz.utc)
    q = tinydb.Query()

    # So that we're not recompiling all history, check to see how far back to go
    # based on the when the earliest record was audited today.
    with open("earliest_update.txt", "r") as f:
        start_time_str = f.read()
        start_time = datetime.fromtimestamp(int(start_time_str), tz=pytz.utc)
        start_time = start_time.replace(hour=0, minute=0, second=0)
    
    # Parallelize the work across all CPUs
    NUM_CPUS = 14
    jobs = [(data_start, today)]
    for i in range(0, (today - start_time).days):
        end = start_time + timedelta(days=i)
        end = end.replace(hour=23, minute=59, second=59)
        jobs.append((data_start, end))
    
    pool = multiprocessing.Pool(processes=NUM_CPUS)
    results = [pool.apply_async(get_account_balances, args=(a[0], a[1])) for a in jobs]
    returns = []
    for p in results:
        try:
            returns.append(p.get())
        except Exception as e:
            print(e)

    # for debugging
    # print(returns)
