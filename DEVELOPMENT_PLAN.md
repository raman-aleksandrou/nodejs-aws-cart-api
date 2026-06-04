### Task 8.1 ✅ 
1. Fork a copy of Cart Service template repository
2. Use the guide (https://docs.nestjs.com/faq/serverless) to wrap Nest.js application to AWS Lambda, but replace Serverless Framework with AWS CDK to create and deploy your lamda as you already did in task 3
3. Deploy your code to AWS Lambda
  - curl https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/profile/cart
  ![alt text](pics/image.png)
  ![checke ](pics/image-1.png)

### Task 8.2 ✅ 
1. Use AWS Console to create a database instance in RDS with PostgreSQL and default configuration.
![alt text](pics/image-2.png)
2. Connect to database instance via a tool called DBeaver or any other similar tools like DataGrip/PgAdmin
Was accessed though Intelli Idea:
![alt text](pics/image-4.png)
3. Create the following tables:
Cart model:
```
  carts:
    id - uuid (Primary key)
    user_id - uuid, not null (It's not Foreign key, because there is no user entity in DB)
    created_at - date, not null
    updated_at - date, not null
    status - enum ("OPEN", "ORDERED") 
```
Cart Item model:
```
  cart_items:
    cart_id - uuid (Foreign key from carts.id)
    product_id - uuid
    count - integer (Number of items in a cart)
```
Write SQL script (sql\init.sql) to fill tables with test examples. Store it in your Github repository. Execute it for your DB to fill data.
![alt text](pics/image-3.png)