# -*- coding: utf-8-*-
import time
import os
import glob
import re
import sys
import unicodedata
from json import JSONEncoder
import json
import requests
import datetime as dd
import pymongo
import collections
from bson.son import SON





def order_scraper(startingDate):
    fesha = startingDate
    delta = dd.timedelta(days=1)
    endDate = dd.date.today()
    while fesha <= endDate:
        if fesha.day<10:
            theDay = "0"+str(fesha.day)
        else:
            theDay = str(fesha.day)
        if fesha.month<10:
            theMonth = "0"+str(fesha.month)
        else:
            theMonth = str(fesha.month)
        theYear="2014"
        dateParam = theDay+theMonth+theYear
        headers = {'content-type': 'application/json'}
        dailyOrdersRequest = requests.get('http://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json?fecha='+dateParam+'&ticket=0942223B-FAE2-4060-950E-36D16916F7E2', headers = headers)
        #Error exception
        dailyOrdersRequest.raise_for_status()

        dailyOrders = json.loads(dailyOrdersRequest.text.encode('utf-8'))

        #{"areas": [{"amount": 284000.0,"name": "Servicios de construcción y mantenimiento / Servicios de atención, mantenimiento y reparaciones de edificios / Gasfitería, calefacción y aire acondicionado"}],"buyer": {"code": "6932","name": "Servicio de Salud Nuble"},"code": "604-1195-SE14","created_at": "2014-11-19T16:57:47.647","currency": "CLP","items_desc": [{"cantidad": 1.0,"monto": 284000.0,"producto": "Mantenimiento o reparación de sistemas de fontanería, gasfitería"}],"items_num": 1,"name": "Alfombra antideslizante","state": 6,"states": [{"date": "22112014","state": 6}],"supplier": {"code": "80954","name": "construccionesoam"},"tender_code": "604-72-LE14","total": 337960.0}

        for data in dailyOrders["Listado"]:
            orderName = data["Nombre"].encode('utf-8')
            orderCode = data["Codigo"].encode('utf-8')
            orderStatusCode = data["CodigoEstado"]
            #CHECK IF THE ORDER CODE EXISTS
            headers = {'content-type': 'application/json'}

            getOrderDataFromMongoRequest = requests.get('http://localhost:3000/api/search?code='+orderCode+'&type=1', headers = headers)

            getOrderDataFromMongo= json.loads(getOrderDataFromMongoRequest.text.encode('utf-8'))
            if getOrderDataFromMongo["isCreated"] == "true":
                if getOrderDataFromMongo["state"]==orderStatusCode:
                    #doNothing
                    pass
                    print "doNothing"
                else:
                    #if orderStatusCode is different create a new entry
                    #{"state": 8, "date": "27022014", "type": 1, "code": "213-L12-20"}
                    postPutData =   {
                                        "state": orderStatusCode,
                                        "date": dateParam,
                                        "type": "1",
                                        "code": orderCode,
                                    }
                    updateData = requests.post('http://localhost:3000/api/state',data=json.dumps(postPutData), headers = headers)
                    #print  updateData.text.encode('utf-8')
                    print "doSomethingDifferent"
                    pass
            else:
                areasArray = []
                headers = {'content-type': 'application/json'}
                newOrderRequest = requests.get('http://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json?codigo='+orderCode+'&ticket=0942223B-FAE2-4060-950E-36D16916F7E2', headers = headers)
                print 'http://api.mercadopublico.cl/servicios/v1/publico/ordenesdecompra.json?codigo='+orderCode+'&ticket=0942223B-FAE2-4060-950E-36D16916F7E2'
                newOrderRequest.raise_for_status()
                newOrder = json.loads(newOrderRequest.text.encode('utf-8'))
                aux = newOrder["Listado"][0]
                #Get Data from Order
                orderCreationDate = aux["Fechas"]["FechaCreacion"].encode('utf-8')
                orderCurrency = aux["TipoMoneda"].encode('utf-8')
                orderTotalAmount = aux["Total"]
                orderTenderCorde = aux["CodigoLicitacion"]
                orderSupplierCode = aux["Proveedor"]["Codigo"].encode('utf-8')
                orderSupplierName = aux["Proveedor"]["Nombre"].encode('utf-8')
                orderBuyerCode = aux["Comprador"]["CodigoOrganismo"].encode('utf-8')
                orderBuyerName = aux["Comprador"]["NombreOrganismo"].encode('utf-8')
                areasAux  = []
                valueAux = []
                nameAux = []
                areasFinal = []
                itemsData = []
                itemsNums = len(aux["Items"]["Listado"])
                for itemm in aux["Items"]["Listado"]:
                    areasAux.append({itemm["Categoria"].encode('utf-8'):itemm["Total"]})
                    itemsData.append({"cantidad": itemm["Cantidad"],
                        "producto": itemm["Producto"].encode('utf-8'),
                        "monto": itemm["Total"]})

                counter = collections.Counter()
                for d in areasAux:
                    counter.update(d)
                for keys in counter.keys():
                    nameAux.append(keys)
                for values in counter.values():
                    valueAux.append(values)
                for nam,val in zip(nameAux, valueAux):
                    areasFinal.append({"name":nam, "amount" : val})
                postOrderData = {
                                    "code": orderCode,
                                    "name": orderName,
                                    "tender_code": orderTenderCorde,
                                    "areas": areasFinal,
                                    "supplier":{
                                                    "code": orderSupplierCode,
                                                    "name": orderSupplierName
                                                },
                                    "buyer":
                                                {
                                                    "code": orderBuyerCode,
                                                    "name": orderBuyerName
                                                },
                                    "total": orderTotalAmount,
                                    "currency": orderCurrency,
                                    "created_at": orderCreationDate,
                                    "state": orderStatusCode,
                                    "states": [
                                                {
                                                    "state": orderStatusCode,
                                                    "date": dateParam
                                                }
                                               ],
                                    "items_num": itemsNums,
                                    "items_desc": itemsData
                                }


                #Post Data to local database
                headers = {'content-type': 'application/json'}
                postData = requests.post('http://localhost:3000/api/orders',data=json.dumps(postOrderData), headers = headers)
        fesha = fesha + delta




def tender_scraper(startingDate):
    fesha = startingDate
    delta = dd.timedelta(days=1)
    endDate = dd.date.today()
    while fesha <= endDate:
        if fesha.day<10:
            theDay = "0"+str(fesha.day)
        else:
            theDay = str(fesha.day)
        print theDay

        if fesha.month<10:
            theMonth = "0"+str(fesha.month)
        else:
            theMonth = str(fesha.month)
        print theMonth
        theYear= '2014'
        dateParam = theDay+theMonth+theYear
        print dateParam
        headers = {'content-type': 'application/json'}
        dailyTendersRequest = requests.get('http://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha='+dateParam+'&ticket=0942223B-FAE2-4060-950E-36D16916F7E2', headers = headers)

        #Error exception
        dailyTendersRequest.raise_for_status()

        dailyTenders = json.loads(dailyTendersRequest.text.encode('utf-8'))


        """{"code":"codigo-de-la-licitacion","type": "L1", "name": "Insumos Médicos", "desc": "Licitación para comprar bebidas", "areas_num": 2, "areas": ["Alimentos / Bebidas / Gaseosas", "Alimentos / Bebidas / Cafe"], "buyer": { "code": "codigo-de-la-empresa", "name": "Cafetería de la Moneda" }, "region": "Región Metropolitana", "published_at": "2014-01-20T10:00:17.173Z", "closed_at": "2014-01-27T15:54:00.000Z", "state": 8, "states": [ { "state": 8, "date": "27022014" } ], "items_num": 4, "items": [aquí se envía el objeto LISTADO completo, que está dentro de la licitación] } """

        for data in dailyTenders["Listado"]:
            tenderName = data["Nombre"].encode('utf-8')
            tenderCode = data["CodigoExterno"].encode('utf-8')
            #hay tender sin fecha de cierre
            try:
                tenderExpiringDate = data["FechaCierre"].encode('utf-8')
            except:
                tenderExpiringDate = "none"
            tenderStatusCode = data["CodigoEstado"]
            #CHECK IF THE EXTERNAL CODE EXISTS
            headers = {'content-type': 'application/json'}
            getDataFromMongoRequest = requests.get('http://localhost:3000/api/search?code='+tenderCode+'&type=0', headers = headers)

            getDataFromMongo= json.loads(getDataFromMongoRequest.text.encode('utf-8'))
            if getDataFromMongo["isCreated"] == "true":
                if getDataFromMongo["state"]==tenderStatusCode:
                    #if statusCode is the same do nothing
                    #print "doNothing"
                    pass
                else:
                    #if statusCode is different create a new entry
                    #{"state": 8, "date": "27022014", "type": 0, "code": "213-L12-20"}
                    postPutData =   {
                                        "state": tenderStatusCode,
                                        "date": dateParam,
                                        "type": "0",
                                        "code": tenderCode,
                                    }
                    updateData = requests.post('http://localhost:3000/api/state',data=json.dumps(postPutData), headers = headers)
                    #print  updateData.text.encode('utf-8')

            else:
                #if don't exists, get the data from the api request
                areasArray = []
                headers = {'content-type': 'application/json'}
                newTenderRequest = requests.get('http://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?codigo='+tenderCode+'&ticket=0942223B-FAE2-4060-950E-36D16916F7E2', headers = headers)
                #print 'http://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?codigo='+tenderCode+'&ticket=0942223B-FAE2-4060-950E-36D16916F7E2'
                newTenderRequest.raise_for_status()
                newTender = json.loads(newTenderRequest.text.encode('utf-8'))
                if newTender["Cantidad"] == 0:
                    #La licitacion desaparece
                    print "Licitacion Missing: " + tenderCode
                else:
                    aux= newTender["Listado"][0]
                    #Get info about buyer
                    buyersCode = aux["Comprador"]["CodigoOrganismo"].encode('utf-8')
                    buyersName = aux["Comprador"]["NombreOrganismo"].encode('utf-8')
                    buyersRegion = aux["Comprador"]["RegionUnidad"].encode('utf-8')
                    #Get info about Tender
                    tenderType = aux["Tipo"].encode('utf-8')
                    tenderDesc = aux["Descripcion"].encode('utf-8')
                    tenderPubDate = aux["Fechas"]["FechaPublicacion"]
                    #Get info about items
                    newTenderElements =  aux["Items"]["Cantidad"]
                    itemsAmmount = len(aux["Items"]["Listado"])
                    listedElements = []
                    for item in aux["Items"]["Listado"]:
                        newTenderCategory =  item["Categoria"].encode('utf-8')
                        areasArray.append(newTenderCategory)
                        aux = {"cantidad": item["Cantidad"],
                        "nombreProducto": item["NombreProducto"].encode('utf-8'),"unidadMedida": item["UnidadMedida"]}
                        adjudData = {}
                        if item["Adjudicacion"]== None:
                            aux["Adjudicacion"]= adjudData
                        else:
                            adjudData = {"cantidadProv": item["Adjudicacion"]["Cantidad"],"nombreProv": item["Adjudicacion"]["NombreProveedor"].encode('utf-8'),"montoTotal": item["Adjudicacion"]["MontoUnitario"]}
                            aux["Adjudicacion"]= adjudData
                        listedElements.append(aux)
                    postMethodData = {
                                        "code": tenderCode,
                                        "type": tenderType,
                                        "name": tenderName,
                                        "desc": tenderDesc,
                                        "areas_num": newTenderElements,
                                        "areas": areasArray,
                                        "buyer":
                                                {
                                                    "code": buyersCode,
                                                    "name": buyersName
                                                },
                                        "region": buyersRegion,
                                        "published_at": tenderPubDate,
                                        "closed_at": tenderExpiringDate,
                                        "state": tenderStatusCode,
                                        "states":   [
                                                    {
                                                        "state": tenderStatusCode,
                                                        "date": dateParam
                                                    }
                                                    ],
                                        "items_num" : itemsAmmount,
                                        "items": listedElements
                                    }
                    #Post Data to local database

                    headers = {'content-type': 'application/json'}
                    postData = requests.post('http://localhost:3000/api/tenders',data=json.dumps(postMethodData), headers = headers)
                    #print  postData.text.encode('utf-8')
        fesha = fesha + delta

def query_try():
    headers = {'content-type': 'application/json'}
    postData = requests.get('http://chilecompra.cloudapp.net/api/orders/', headers = headers)
    print len(postData.json())


def query_database_tender():
    from pymongo import MongoClient
    db = MongoClient('mongodb://localhost:27017').chilecompra
    #print db.tenders.find({'code':"1155-412-LE14"}).count()
    licits =[]
    cont = 1
    for items in db.tenders.find():
        #print items
        for area, iten in zip(items['areas'],items['items']):
            #print iten
            asd =  area.encode('utf-8').split(" / ")
            ress = asd[0].strip() + "@" +asd[1].strip()+ "@" +asd[2].strip()
            try:
                licits.append(ress + "@" + items['code'].encode('utf-8')+ "@" +iten['unidadMedida'].encode('utf-8')+ "@" +iten['nombreProducto'].encode('utf-8')+ "@" +str(iten['cantidad'])+"@" +items['buyer']['name'].encode('utf-8')+ "@" + str(items['state'])+ "@" + str(iten['Adjudicacion']['cantidadProv'])+ "@" + iten['Adjudicacion']['nombreProv'].encode('utf-8').replace('\n',' ').replace('             ',' ') + "@" + str(iten['Adjudicacion']['montoTotal']))
            except:
                licits.append(ress + "@" + items['code'].encode('utf-8')+ "@" +iten['unidadMedida'].encode('utf-8')+ "@" +iten['nombreProducto'].encode('utf-8')+ "@" +str(iten['cantidad'])+ "@"+items['buyer']['name'].encode('utf-8')+ "@" + str(items['state']))
        #if items['code'].encode('utf-8')== "2274-398-L114":
        #    sys.exit(0)
        #cont = cont + 1
    theFile = open("tendersData.txt", 'w')
    for item in licits:
        theFile.write("%s\n" % item)
    theFile.close()

def query_database_order():
    from pymongo import MongoClient
    db = MongoClient('mongodb://localhost:27017').chilecompra
    #print db.tenders.find({'code':"1155-412-LE14"}).count()
    licits =[]
    cont = 1
    for items in db.orders.find():
        if items['items_num']>1:
            #print items
            for subitem,area in zip(items['items_desc'], items['areas']):
                asd = area['name'].encode('utf-8').split(" / ")
                ress = asd[0].strip() + "@" +asd[1].strip()+ "@" +asd[2].strip()
                licits.append(ress + "@" +items['supplier']['name'].encode('utf-8') + "@" +items['tender_code'].encode('utf-8') + "@" +items['code'].encode('utf-8') + "@" +str(items['state']) + "@" + str(subitem['monto']/subitem['cantidad'])+ "@" +subitem['producto'].encode('utf-8') +"@" + items['buyer']['name'].encode('utf-8') + "@" + str(items['buyer']['code']))


    theFile = open("ordersData.txt", 'w')
    for item in licits:
        theFile.write("%s\n" % item)
    theFile.close()

def fixx():
    asssd=['1553-1799-L114','1638-195-L114','1673-22-L114','1729-114-L114','1736-4534-SE14','1736-4536-SE14','1736-4552-SE14','1736-4626-SE14','2089-67-L112','2103-76-L114','2446-863-LE14','2708-1050-CM14','2710-507-L114','3017-1297-L114','3153-167-LP12','3286-908-SE14','3286-910-SE14','3305-7-LE14','3309-497-SE14','3309-500-SE14','3328-23-LE14','3459-5-LE14','3485-61-LP13','3486-602-SE14','3486-603-SE14','3510-215-L114','3594-36-LE13','3594-771-SE14','3604-174-L114','3650-6-LP14','3712-10-LE14','3810-1711-SE14','3836-109-LP10','3841-12-LE14','3841-15-LE14','3928-171-LE13','4088-6-LE14','4171-2632-SE14','4171-2638-SE14','4171-2641-SE14','4171-30-LE13','4171-86-LE12','4255-4-LE12','4408-44-LE13','4408-745-SE14','4408-750-SE14','4408-906-SE14','4485-272-CM14','4515-16-LE13','4515-748-SE14','4968-30-LE14','501-23-LE13','5012-186-LP14','527481-14-LE14','3305-1659-SE14','3305-1576-SE14','3305-1573-SE14','1736-152-LE13']
    areasArray = []
    for tenderCode in asssd:
        headers = {'content-type': 'application/json'}
        newTenderRequest = requests.get('http://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?codigo='+tenderCode+'&ticket=0942223B-FAE2-4060-950E-36D16916F7E2', headers = headers)
        print newTenderRequest
        #print 'http://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?codigo='+tenderCode+'&ticket=0942223B-FAE2-4060-950E-36D16916F7E2'
        newTenderRequest.raise_for_status()
        newTender = json.loads(newTenderRequest.text.encode('utf-8'))
        if newTender["Cantidad"] == 0:
            #La licitacion desaparece
            print "Licitacion Missing: " + tenderCode
        else:
            aux= newTender["Listado"][0]
            #Get info about buyer
            tenderName = aux["Nombre"]
            tenderCode = aux["CodigoExterno"]
            tenderStatusCode = aux["CodigoEstado"]
            tenderExpiringDate = aux['Fechas']['FechaCierre']
            buyersCode = aux["Comprador"]["CodigoOrganismo"].encode('utf-8')
            buyersName = aux["Comprador"]["NombreOrganismo"].encode('utf-8')
            buyersRegion = aux["Comprador"]["RegionUnidad"].encode('utf-8')
            #Get info about Tender
            tenderType = aux["Tipo"].encode('utf-8')
            tenderDesc = aux["Descripcion"].encode('utf-8')
            tenderPubDate = aux["Fechas"]["FechaPublicacion"]
            #Get info about items
            newTenderElements =  aux["Items"]["Cantidad"]
            itemsAmmount = len(aux["Items"]["Listado"])
            listedElements = []
            for item in aux["Items"]["Listado"]:
                newTenderCategory =  item["Categoria"].encode('utf-8')
                areasArray.append(newTenderCategory)
                aux = {"cantidad": item["Cantidad"],
                "nombreProducto": item["NombreProducto"].encode('utf-8'),"unidadMedida": item["UnidadMedida"]}
                adjudData = {}
                if item["Adjudicacion"]== None:
                    aux["Adjudicacion"]= adjudData
                else:
                    adjudData = {"cantidadProv": item["Adjudicacion"]["Cantidad"],"nombreProv": item["Adjudicacion"]["NombreProveedor"].encode('utf-8'),"montoTotal": item["Adjudicacion"]["MontoUnitario"]}
                    aux["Adjudicacion"]= adjudData
                listedElements.append(aux)
            postMethodData = {
                                "code": tenderCode,
                                "type": tenderType,
                                "name": tenderName,
                                "desc": tenderDesc,
                                "areas_num": newTenderElements,
                                "areas": areasArray,
                                "buyer":
                                        {
                                            "code": buyersCode,
                                            "name": buyersName
                                        },
                                "region": buyersRegion,
                                "published_at": tenderPubDate,
                                "closed_at": tenderExpiringDate,
                                "state": tenderStatusCode,
                                "states":   [
                                            {
                                                "state": tenderStatusCode,
                                                "date": "06122014"
                                            }
                                            ],
                                "items_num" : itemsAmmount,
                                "items": listedElements
                            }
            #Post Data to local database

            headers = {'content-type': 'application/json'}
            postData = requests.post('http://localhost:3000/api/tenders',data=json.dumps(postMethodData), headers = headers)
            #print  postData.text.encode('utf-8')

def daily_scraper(startingDate):
    fesha = startingDate
    delta = dd.timedelta(days=1)
    endDate = dd.date(2010,01,01)
    while fesha >= endDate:
        if fesha.day<10:
            theDay = "0"+str(fesha.day)
        else:
            theDay = str(fesha.day)
        #print theDay

        if fesha.month<10:
            theMonth = "0"+str(fesha.month)
        else:
            theMonth = str(fesha.month)
        #print theMonth
        theYear = str(fesha.year)
        #theYear= '2014'
        dateParam = theDay+theMonth+theYear
        print dateParam
        headers = {'content-type': 'application/json'}
        dailyTendersRequest = requests.get('http://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha='+dateParam+'&estado=Todos&ticket=F8537A18-6766-4DEF-9E59-426B4FEE2844', headers = headers)

        #Error exception
        dailyTendersRequest.raise_for_status()

        dailyTenders = json.loads(dailyTendersRequest.text.encode('utf-8'))
        #print dailyTenders['Cantidad']
        for element in dailyTenders['Listado']:
            #print element
            try:
                nameT = element['Nombre'].encode('utf-8')
            except:
                nameT = "null"
            try:
                codeT = element['CodigoExterno'].encode('utf-8')
            except:
                codeT = "null"
            try:
                closedT = element['FechaCierre'].encode('utf-8')
            except:
                closedT = "null"
            try:
                stateT = element['CodigoEstado']
            except:
                stateT = 999
            postMethodData = {
                    "name": nameT,
                    "code": codeT,
                    "closed_at": closedT,
                    "state": stateT,
                    "query_date": dateParam}
            print postMethodData
            #localhost:3000
            postData = requests.post('http://localhost:3000/api/insertion',data=json.dumps(postMethodData), headers = headers)
        fesha = fesha - delta


if __name__ == "__main__":
    #order_scraper(dd.date(2014,12,06))
    #tender_scraper(dd.date(2015,05,18))
    #query_database_tender()
    #query_database_order()
    #query_try()
    #fixx()
    daily_scraper(dd.date(2015,05,13))






