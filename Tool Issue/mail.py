from __future__ import print_function
from datetime import datetime
from logging import error

import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from email.message import EmailMessage
import base64
from datetime import *
import pandas as pd
import numpy as np

"""Created by : Ishrath, MTech(W&S), IIT Gandhinagar.
Custom developed reminder script, to send regular emails to tool issuers reminding the due date for return of tools"""

# Defining scopes for google apis. If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.compose','https://www.googleapis.com/auth/spreadsheets.readonly']
SAMPLE_SPREADSHEET_ID = '1VZiASU5mcS8k_2VkooUil5yMl_YgLHsvJZTD1lhp6rI'
SAMPLE_RANGE_NAME = 'Form Responses 2!A:O'#'2021-22!A:O'

#Function to send mail with list of tools "li" to be returned.
def sendMail(creds,dest,li):
    """Function to draft and send email"""
    try:
        #Call gmail service
        service = build('gmail', 'v1', credentials=creds)
        #Create mail draft
        message = EmailMessage()
        #Edit email body
        message.set_content('Hi Tool Issuer,\n\nThis is a gentle reminder to return a tool/tool(s) - {} you issued from Machineshop within the next 2 days.\nTo avoid receiving further reminders, please make sure that the staff records the receipt of tools.\n\nKindly adhere to the \"Return Policies\" in order to avoid inconvinience to others and for timely issue of NOCs.\n\nRegards,\nMachineshop\nAB06/106'.format(str(li).removeprefix("[").removesuffix("]")))
        #Set destination email, sender's email and subject.
        message['To'] = dest
        message['From'] = 'machineshop@iitgn.ac.in'
        message['Subject'] = 'Gentle Reminder!'

        # Encoded message
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()) \
            .decode()

        create_message = {
            'raw': encoded_message
        }
        # Calling Service to send message
        send_message = (service.users().messages().send
                        (userId="me", body=create_message).execute())
        print(F'Message Id: {send_message["id"]}')
    except HttpError as error:
        print(F'An error occurred: {error}') #Printing any errors encountered during execution.
        send_message = None
    except Exception as err:
        print(err) #Printing any errors encountered during execution.

def main():
    """Main method to access google sheets and get list of users to send reminders."""

    #Setting up log file
    if os.path.exists('C:\\Users\\IITGN\\Desktop\\ES106\\Setmore Analysis\\log.txt'):
        logFile = open('C:\\Users\\IITGN\\Desktop\\ES106\\Setmore Analysis\\log.txt','a')
    else:
        logFile = open('C:\\Users\\IITGN\\Desktop\\ES106\\Setmore Analysis\\log.txt','w')
    creds = None

    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('C:\\Users\\IITGN\\Desktop\\ES106\\Setmore Analysis\\token.json'):
        print(os.path)
        #Getting credentials from token file.
        creds = Credentials.from_authorized_user_file('C:\\Users\\IITGN\\Desktop\\ES106\Setmore Analysis\\token.json', SCOPES)

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'C:\\Users\\IITGN\\Desktop\\ES106\Setmore Analysis\\credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('C:\\Users\\IITGN\\Desktop\\ES106\Setmore Analysis\\token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        #Create service to access the google sheet
        service = build('sheets', 'v4', credentials=creds)

        # Call the Sheets API
        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=SAMPLE_SPREADSHEET_ID,
                                    range=SAMPLE_RANGE_NAME).execute()
        values = result.get('values', [])

        if not values:
            print('No data found.')
            return

        #Create a dataframe of values from sheet
        df = pd.DataFrame(values)
        df = df.fillna("Email ID")
        #Getting all those rows where Actual return date is empty
        df = df[df[12]=='Email ID']
        #Converting date format
        df[10] = pd.to_datetime(df[10], format="%m/%d/%Y")
        df[0] = pd.to_datetime(df[0], format="%m/%d/%Y %H:%M:%S")
        #Getting rows that have Approx. return date within next 2 days
        df1 = df[(df[10]-pd.to_datetime('today'))/ np.timedelta64(1, 'D')<=2]
        logFile.write(str(pd.to_datetime('today')))
        #Getting rows that have Approx. Return date of over a month from today 
        df2 = df[(pd.to_datetime('today')-df[0])/ np.timedelta64(1, 'D')>=28]
        df = pd.concat([df1,df2],axis=0)
        #Getting list of all email IDs
        emails_df = df[df[1]!="Email ID"]
        li = pd.Series(emails_df[1].drop_duplicates()).to_list()
        logFile.write(str(li))
        #Sending individual emails
        for dest in li:
            #List of items issued
            Items_list = pd.Series(df[df[1]==dest][7].drop_duplicates()).to_list()
            #Calling the function to send emails
            sendMail(creds,dest,Items_list)
            print(dest)
        logFile.write("Sent Successfully"+"\n")  
    except HttpError as err:
        logFile.write(str(err)+"\n")#Logging errors if encountered any
        print(err)
    except Exception as err:
        print(err)
        logFile.write(str(err)+"\n")#Logging errors if encountered any
    logFile.close()

if __name__ == '__main__':
    main()