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

requestCount=0
positionToken = 0
tokens = ['564D2E7A-F342-45DC-8C3D-CBC7A9B2B27C','DA2A0390-CEAC-4B8D-AE14-A13BB8768EAE','4B291235-9246-46D7-B30F-A968B9E1018B','704B969C-9B3D-48CB-B5EC-1C5B5D1AF360','56EFE130-0555-41C3-8E79-E9ACC3A9E1BD','0942223B-FAE2-4060-950E-36D16916F7E2','404303EF-0694-475A-B091-02A419258262','33BDB1DA-7488-4FA4-B854-E47FD9EB9E5A','B0BC899A-C7C3-4252-B07C-FBFE2C35107C','B5B396EB-A59B-455D-AF8C-6ABECF1A8D5A']

def tender_array_creation():
    #Set token base case
    nonEmpty = True
    pageNumber = 1
    itemNumber = 10

    while nonEmpty:
        arrayIndex = []
        #Set variables
        #Get codes from our API
        headers = {'content-type': 'application/json'}
        codeIndex = requests.get('http://chilecompra.cloudapp.net/api/insertions_pag?items='+str(itemNumber)+'&page='+str(pageNumber), headers = headers)
        arrayGlobal =  json.loads(codeIndex.text.encode('utf-8'))
        #print arrayGlobal

        for element in arrayGlobal:
            arrayIndex.append(element["code"].encode('utf-8'))
            #print arrayIndex

        #Post Data
        tender_scraper(arrayIndex)

        pageNumber = pageNumber +1

        #Iterate and get data from
        if len(arrayIndex) < itemNumber:
            nonEmpty = False
            print "Se recorre todo"




def tender_scraper(arrayIndex):
    global tokens
    global positionToken
    global requestCount
    tokenCode = tokens[positionToken]

    for tenderCode in arrayIndex:

        areasArray = []
        headers = {'content-type': 'application/json'}
        newTenderRequest = requests.get('http://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?codigo='+tenderCode+'&ticket='+tokenCode, headers = headers)
        newTenderRequest.raise_for_status()
        requestCount = requestCount+1

        #Verifico cantidad de veces que he usado la API
        if requestCount > 9500:
            requestCount=0
            positionToken = positionToken + 1
            #Se acaban los codigos
            if positionToken>9:
                print "Se acaban los codigos. Partir desde "+tenderCode
                sys.exit(0)
            tokenCode = tokens[positionToken]

        #Parseo los datos

        newTender = json.loads(newTenderRequest.text.encode('utf-8'))
        if newTender["Cantidad"] == 0:
            #La licitacion desaparece
            print "Licitacion Missing: " + tenderCode
        else:
            aux= newTender["Listado"][0]
            try:
                tenderName = aux["Nombre"].encode('utf-8')
            except:
                tenderName = "MissingData"
            try:
                tenderStatusCode = aux["CodigoEstado"]
            except:
                tenderStatusCode = 0
            #Get info about buyer
            try:
                buyersCode = aux["Comprador"]["CodigoOrganismo"].encode('utf-8')
            except:
                buyersCode = "MissingData"
            try:
                buyersName = aux["Comprador"]["NombreOrganismo"].encode('utf-8')
            except:
                buyersName = "MissingData"
            try:
                buyersRegion = aux["Comprador"]["RegionUnidad"].encode('utf-8')
            except:
                buyersRegion= "MissingData"
            #Get info about Tender
            try:
                tenderType = aux["Tipo"].encode('utf-8')
            except:
                tenderType= "MissingData"
            try:
                tenderDesc = aux["Descripcion"].encode('utf-8')
            except:
                tenderDesc = "MissingData"
            try:
                tenderPubDate = aux["Fechas"]["FechaPublicacion"]
            except:
                tenderPubDate= "MissingData"

            try:
                tenderExpiringDate = aux["Fechas"]["FechaCierre"]
            except:
                tenderExpiringDate= "MissingData"

            #Get info about items
            listedElements = []
            try:
                newTenderElements =  aux["Items"]["Cantidad"]
            except:
                newTenderElements = "MissingData"
            try:
                itemsAmmount = len(aux["Items"]["Listado"])
            except:
                itemsAmmount = 0
            for item in aux["Items"]["Listado"]:
                try:
                    newTenderCategory =  item["Categoria"].encode('utf-8')
                except:
                    newTenderCategory = "MissingData"
                areasArray.append(newTenderCategory)
                try:
                    aux = {"cantidad": item["Cantidad"],
                    "nombreProducto": item["NombreProducto"].encode('utf-8'),"unidadMedida": item["UnidadMedida"]}
                    adjudData = {}
                    if item["Adjudicacion"]== None:
                        aux["Adjudicacion"]= adjudData
                    else:
                        adjudData = {"cantidadProv": item["Adjudicacion"]["Cantidad"],"nombreProv": item["Adjudicacion"]["NombreProveedor"].encode('utf-8'),"montoTotal": item["Adjudicacion"]["MontoUnitario"]}
                        aux["Adjudicacion"]= adjudData
                except:
                    aux = "MissingData"
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
                                            "date": "12062015"
                                        }
                                        ],
                            "items_num" : itemsAmmount,
                            "items": listedElements
                        }
            #Post Data to local database

            headers = {'content-type': 'application/json'}
            postData = requests.post('http://localhost:3000/api/tenders',data=json.dumps(postMethodData), headers = headers)
            #print postMethodData
            #print  postData.text.encode('utf-8')




if __name__ == "__main__":
    tender_array_creation()
