import asyncio
import asyncpg
import sys

async def create_db():
    try:
        # Connect to default postgres to create the DB
        conn = await asyncpg.connect(user='postgres', password='1234', host='localhost')
        try:
            await conn.execute('CREATE DATABASE documind_test')
            print("Database 'documind_test' created successfully.")
        except asyncpg.exceptions.DuplicateDatabaseError:
            print("Database 'documind_test' already exists.")
        except Exception as e:
            print(f"Error creating database: {e}")
        finally:
            await conn.close()

        # Connect to the new database to create extension
        conn = await asyncpg.connect(user='postgres', password='1234', host='localhost', database='documind_test')
        try:
            await conn.execute('CREATE EXTENSION IF NOT EXISTS vector')
            print("Extension 'vector' enabled.")
        except Exception as e:
            print(f"Error creating extension: {e}")
        finally:
            await conn.close()

    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    asyncio.run(create_db())
