import pymongo
import sys


from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017').chilecompra2

listt = []

for item in client.insertions.find():
    estados = ""
    for elem in item['states']:
        estados = estados +";;" + elem['date'].encode('utf-8')+ " - " + str(elem['state']).encode('utf-8')
    element = item['code'].encode('utf-8') + "@" +item['name'].encode('utf-8')+ "@"+str(item['closed_at'])+"@"+estados[2:]
    listt.append(element)

theFile = open('filee.txt', 'w')
for item in listt:
    theFile.write("%s\n" % item)
theFile.close()

