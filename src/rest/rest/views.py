from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
import logging
import os
from pymongo import MongoClient

mongo_uri = 'mongodb://' + os.environ["MONGO_HOST"] + ':' + os.environ["MONGO_PORT"]
db = MongoClient(mongo_uri)['test_db']

class TodoListView(APIView):
    
    def get(self, request):
        try:
            todos_collection = db.todos
            todos = list(todos_collection.find())
            for todo in todos:
                todo['_id'] = str(todo['_id'])  # Convert ObjectId to string for JSON serialization
            return Response({'todos': todos}, status=status.HTTP_200_OK)
        except Exception as e:
            logging.error(f"Error fetching todos: {str(e)}")
            return Response({'error': 'Failed to fetch todos'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            if not request.body:
                return Response({'error': 'Empty request body'}, status=status.HTTP_400_BAD_REQUEST)

            data = json.loads(request.body.decode('utf-8'))
            description = data.get('description')
            if not description:
                return Response({'error': 'Description is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            todos_collection = db.todos
            result = todos_collection.insert_one({'description': description})
            todo = todos_collection.find_one({'_id': result.inserted_id})
            todo['_id'] = str(todo['_id'])  # Convert ObjectId to string for JSON serialization
            return Response(todo, status=status.HTTP_201_CREATED)
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logging.error(f"Error adding todo: {str(e)}")
            return Response({'error': 'Failed to add todo'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
