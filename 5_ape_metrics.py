import tinydb
from shutil import copy
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from datetime import datetime
from time import mktime
import statistics
import pandas as pd

sdb = tinydb.TinyDB("new_shares_db.json")
pdb = tinydb.TinyDB("portfolio_db.json")
rdb = tinydb.TinyDB("results_db.json")
q = tinydb.Query()

now = datetime.today()
#start = mktime(now.replace(hour=23, minute=59, day=now.day - 7).timetuple())
start = mktime(now.replace(hour=23, minute=59, day=27, month=now.month - 1).timetuple())
end = mktime(now.timetuple())
#portfolios = rdb.search((q.type == "portfolio") & (q.time > start) & (q.time < end))
#purchases = rdb.search((q.type == "purchase") & (q.time > start) & (q.time < end))

portfolios = rdb.search(q.type == "portfolio")
purchases = rdb.search(q.type == "purchase")

count_portfolios = len(portfolios)
sum_portfolios = sum([x["value"] for x in portfolios])
count_purchases = len(purchases)
sum_purchases = sum([x["value"] for x in purchases])

distinct_apes = float(len(set([p['u'] for p in rdb.all()])))

print(f'{count_portfolios} portfolios totalling {sum_portfolios} shares. Average of {sum_portfolios / count_portfolios} shares per portfolio.')
print(f'{statistics.median([x["value"] for x in portfolios])} median portfolio shares.')
print(f'{count_purchases} purchases totalling ${sum_purchases}. Average of ${sum_purchases / count_purchases} per purchase.')
print(f'{statistics.median([x["value"] for x in purchases])} median purchase value.')

all_shares = [x["value"] for x in portfolios]
all_shares.extend([y["value"] for y in purchases])
print(f'{sum(all_shares)} shares total by {distinct_apes} apes.')
print(f'Shares held per Ape account: {sum(all_shares) / distinct_apes}')
data = np.array(all_shares)

print (f'Mode: {stats.mode(data)}')
print (f'Std Dev: {stats.tstd(data)}')

def value(e):
    return e["value"]
portfolios.sort(key=value, reverse=True)
purchases.sort(key=value, reverse=True)

hist, bins = np.histogram(data, bins=np.geomspace(1, 16384, num=15))

#hist, bins = np.histogram(data, bins=np.linspace(1, 800))


hist = np.append(hist, [0])
print(hist)
print(bins)
plt.style.use('seaborn')
plt.figure(figsize = (16, 9))
plt.plot(bins, hist, color = 'black', linestyle = 'dashed')
plt.scatter(bins, hist, marker = 'o', s = 25, color = 'red')
plt.xscale("log", base=2)
#plt.xscale("linear")
plt.show()

with open("shares.csv", "w+", encoding="utf-8") as f:
    f.write("shares,u/,time,urls\n")
    for record in portfolios:
        urls = ["https://redd.it/"+x.split('/')[-3] for x in record["urls"] if '/' in x]
        f.write(f'{str(record["value"])},{record["u"]},{np.datetime64(datetime.utcfromtimestamp(record["time"]))},"{" ".join(urls)}"\n')
    for record in purchases:
        urls = ["https://redd.it/"+x.split('/')[-3] for x in record["urls"] if '/' in x]
        if record["value"] > 0:
            f.write(f'{str(record["value"])},{record["u"]},{np.datetime64(datetime.utcfromtimestamp(record["time"]))},"{" ".join(urls)}"\n')

# with open("shares.csv", "w+", encoding="utf-8") as f:
#     f.write("shares,u/,time,urls\n")
#     for record in portfolios:
#         f.write(f'{str(record["value"])},{record["u"]},{np.datetime64(datetime.utcfromtimestamp(record["time"]))},"{" ".join(record["urls"])}"\n')
#     for record in purchases:
#         if record["value"] > 0:
#             f.write(f'{str(record["value"])},{record["u"]},{np.datetime64(datetime.utcfromtimestamp(record["time"]))},"{" ".join(record["urls"])}"\n')

pf_timestamps = [np.datetime64(datetime.utcfromtimestamp(x["time"])) for x in portfolios]
pur_timestamps = [np.datetime64(datetime.utcfromtimestamp(x["time"])) for x in purchases]

pf_values = [x["value"] for x in portfolios]
pur_values = [x["value"] for x in purchases]

pf_df = pd.DataFrame(pf_timestamps)
pur_df = pd.DataFrame(pur_timestamps)


pf_shares_df = pd.DataFrame({"share_count": pf_values, "date": pf_timestamps})
pur_shares_df = pd.DataFrame({"share_count": pur_values, "date": pur_timestamps})

pf_shares_df.index = pf_shares_df.date.dt.normalize()
pur_shares_df.index = pur_shares_df.date.dt.normalize()

pf_shares_df = pf_shares_df.drop("date", axis=1)
pur_shares_df = pur_shares_df.drop("date", axis=1)

pf_shares_df = pf_shares_df.resample('D').sum()
pur_shares_df = pur_shares_df.resample('D').sum()

pf_shares_df = pf_shares_df[~(pf_shares_df['share_count'].isnull())]
pur_shares_df = pur_shares_df[~(pur_shares_df['share_count'].isnull())]

pf_shares_df.plot(kind="bar", figsize=(16,9), title="DRS Portfolios per Day")
print(f"Shares today: {pf_shares_df._values[-1]}")
pur_shares_df.plot(kind="bar", figsize=(16,9), title="DRS Purchases per Day")

posts_per_day = pf_df.groupby([pf_df[0].dt.month, pf_df[0].dt.day]).count()

print(f"PF posts today: {posts_per_day._values[-1]}")

posts_per_day.plot(kind="bar", figsize=(16,9), title="DRS Posts per Day")
pur_df.groupby([pur_df[0].dt.month, pur_df[0].dt.day]).count().plot(kind="bar", figsize=(16,9), title="Purchases per Day")

print(f'Count of XXXX portfolios {len([x for x in all_shares if x > 999])}')

for i in range(-28, 0):
    days_ago = i
    count_posts = posts_per_day._values[i][0]
    count_shares = pf_shares_df._values[i][0]
    print(f'day {i+1}: {str(count_shares / count_posts)}')
