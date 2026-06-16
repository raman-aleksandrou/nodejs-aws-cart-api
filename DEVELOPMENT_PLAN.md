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

### Task 8.3 ✅ 
1. Update source code in the application to use PostgreSQL instead of memory storage. Imlemented with pg. 
2. Integrate with RDS
3. Extend your AWS CDK Stack file with credentials to your database instance and pass it to lambda's environment variables section.
#### Testing
  ##### 1. Register
  Invoke-RestMethod -Method Post -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/auth/register" -ContentType "application/json" -Body '{"name":"testuser-1","password":"testpass"}'
    ![alt text](pics/image-5.png)
    "userId": "6a3ea7b3-def1-4974-8cf9-e06168270039"

  ##### 2. Get cart
  Invoke-RestMethod -Method Get -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/profile/cart" -Headers @{Authorization="Basic dGVzdHVzZXItMTp0ZXN0cGFzcw=="}
    ![alt text](pics/image-6.png)

  ##### 3. Add item to cart
  Invoke-RestMethod -Method Put -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/profile/cart" -Headers @{Authorization="Basic dGVzdHVzZXItMTp0ZXN0cGFzcw=="} -ContentType "application/json" -Body '{"product":{"id":"6a3ea7b3-def1-4974-8cf9-e06168270039","title":"Test","description":"Desc","price":11.11},"count":11}'
  ![alt text](pics/image-7.png)

### Additional tasks
✅ Create orders table and integrated with it Order model:
```  orders:
    id - uuid
    user_id - uuid
    cart_id - uuid (Foreign key from carts.id)
    payment - JSON
    delivery - JSON
    comments - text
    status - ENUM or text
    total - number
```    
![alt text](pics/image-8.png)

✅ Set status to 'ORDERED' after checkout instead of cart deletion.
#### Testing 
● Step 1 — Register
  Invoke-RestMethod -Method Post -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/auth/register" -ContentType "application/json" -Body '{"name":"testuser-1","password":"testpass"}'

  ![alt text](pics/image-9.png)

  Step 2 — Add item to cart
  Invoke-RestMethod -Method Put -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/profile/cart" -Headers @{Authorization="Basic dGVzdHVzZXItMTp0ZXN0cGFzcw=="} -ContentType "application/json" -Body '{"product":{"id":"6a3ea7b3-def1-4974-8cf9-e06168270039","title":"Test","description":"Desc","price":11.11},"count":11}'

  ![alt text](pics/image-10.png)

  Step 3 — Checkout
  Invoke-RestMethod -Method Put -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/profile/cart/order" -Headers @{Authorization="Basic dGVzdHVzZXItMTp0ZXN0cGFzcw=="} -ContentType "application/json" -Body '{"address":{"address":"123 St","firstName":"John","lastName":"Doe","comment":""}}'

  ![alt text](pics/image-11.png)

  Step 4 — Get cart
  (Invoke-RestMethod -Method Get -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/profile/cart" -Headers @{Authorization="Basic dGVzdHVzZXItMTp0ZXN0cGFzcw=="}).Count
  Should return 0 — a fresh empty cart, not a deletion.

  ![alt text](pics/image-12.png)

  Step 6 — Get orders
  Invoke-RestMethod -Method Get -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/profile/cart/order" -Headers @{Authorization="Basic dGVzdHVzZXItMTp0ZXN0cGFzcw=="}

  ![alt text](pics/image-13.png)

  Checked status in db
  
  ![alt text](pics/image-14.png)

  ✅ Create users table and integrate with it

  #### Testing 
  Step 1 — Register
  Invoke-RestMethod -Method Post -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/auth/register" -ContentType "application/json" -Body '{"name":"testuser-2","password":"testpass"}'

  ![alt text](pics/image-15.png)

  ![alt text](pics/image-16.png)

  Step 2 — Try register same user again (should fail)
  Invoke-RestMethod -Method Post -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/auth/register" -ContentType "application/json" -Body '{"name":"testuser-2","password":"testpass"}'
  
  ![alt text](pics/image-17.png)

  Step 3 — Add item to cart (verifies auth still works)
  $b64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("testuser-2:testpass"))
  Invoke-RestMethod -Method Put -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/profile/cart" -Headers @{Authorization="Basic $b64"} -ContentType "application/json" -Body '{"product":{"id":"6a3ea7b3-def1-4974-8cf9-e06168270039","title":"Test","description":"Desc","price":10},"count":1}'

  ![alt text](pics/image-18.png)

  Step 4 — Verify in DB
  SELECT id, name, email FROM users;
  Should show testuser-2 row — proving users now survive restarts.

  ![alt text](pics/image-19.png)

 ✅ Transaction based creation of checkout
  Step 1 — Register
  Invoke-RestMethod -Method Post -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/auth/register" -ContentType "application/json" -Body '{"name":"testuser-3","password":"testpass"}'

  ![alt text](pics/image-20.png)

  Step 2 — Add item to cart
  $b64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("testuser-3:testpass"))
  Invoke-RestMethod -Method Put -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/profile/cart" -Headers @{Authorization="Basic $b64"} -ContentType "application/json" -Body '{"product":{"id":"6a3ea7b3-def1-4974-8cf9-e06168270039","title":"Test","description":"Desc","price":10},"count":2}'

  ![alt text](pics/image-21.png)

  Step 3 — Checkout (runs inside transaction)
  Invoke-RestMethod -Method Put -Uri "https://r4habz0xwf.execute-api.eu-central-1.amazonaws.com/api/profile/cart/order" -Headers @{Authorization="Basic $b64"} -ContentType "application/json" -Body '{"address":{"address":"123 St","firstName":"John","lastName":"Doe","comment":""}}'

  ![alt text](pics/image-22.png)

  Both order_status = OPEN and cart_status = ORDERED must be if the transaction rolled back

  ![alt text](pics/image-23.png)

  ✅ Integrate Cart service with FE repository
  https://github.com/raman-aleksandrou/nodejs-aws-shop-react/pull/4

  ### Task 9.1 ✅ 
1. Fork a copy of Cart Service template repository if you have not done it yet. ✅ 
2. Create Dockerfile that will build a docker image to run the Cart Service. ✅
3. Make sure to perform the following steps:
- Add .dockerignore file to minimize build context. ✅
- Files and folders generated by the application or npm should be excluded. ✅
- Provide explanations to why the folder was ignored ✅
4. Optimize your image/container:
- Minimize docker image size to be less than 500 MB. ✅ (52 MB compressed / 180 MB uncompressed)
- Optimize image build times. Dockerfile commands that run npm install should not depend on typescript files. ✅
- OPTIONAL: add more folders to .dockerignore with explanations ✅
- OPTIONAL: Minimize docker image size to about 140 MB. ✅ (52 MB compressed; see size note below)
- OPTIONAL: Optimize build times by utilizing multistage builds. ✅
- OPTIONAL: Lint Dockerfile. ✅ (hadolint — 0 findings)

#### Testing
- Build: `docker build -t cart-api:task9 .` → succeeds.
- Run: `docker run -d --name cart-api-test -p 4000:4000 cart-api:task9`
  - Logs show Nest bootstrapped, all routes mapped, `App is running on 4000 port`.
  - `GET http://localhost:4000/ping` → `200 {"statusCode":200,"message":"OK"}`
  - `GET http://localhost:4000/` → `200`
- DB-backed routes require Postgres env vars at runtime; `pg` connects lazily so the server boots without them.

#### Image size note
Measured three ways:
- **Compressed (`docker image inspect ... --format {{.Size}}`): ~52 MB** — what gets pushed/pulled to a registry; beats the optional 140 MB goal.
- **Uncompressed (sum of `docker history` layers): ~180 MB** — extracted-on-disk size. Near the floor for `node:20-alpine`: the Node runtime layer alone is ~130 MB.
- **`docker images` SIZE column: 233 MB** — inflated because Docker Desktop's containerd image store counts compressed + uncompressed blobs together (~52 + ~180). This is a measurement artifact, not extra payload.

#### Linting
- `docker run --rm -i hadolint/hadolint < Dockerfile` → **0 findings** (clean pass).