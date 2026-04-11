# Deployment

1. Signup in AWS Console website
2. Launch ec2 instance(used ubutu - explore other OS)
3. create a key-security group and download to a specified folder
   - go through the settings and other information before launching the instance, for now it was just defaulted
4. Launch the instance in the portal
5. connect to the instance using ssh(or any other)

## Instance

- name > i-01921ef1401af3d4d
- Open an SSH client.

- Locate your private key file. The key used to launch this instance is MyDev-Secret.pem
  - chmod 400 "mywebserver-security.pem"

- Run this command, if necessary, to ensure your key is not publicly viewable.
- chmod 400 "MyDev-Secret.pem"

- Connect to your instance using its Public DNS:
- ec2-16-171-200-163.eu-north-1.compute.amazonaws.com

<!-- ssh -i "MyDev-Secret.pem" ubuntu@ec2-16-171-200-163.eu-north-1.compute.amazonaws.com -->

ssh -i "mywebserver-security.pem" ubuntu@ec2-13-61-151-199.eu-north-1.compute.amazonaws.com

This will run the ubuntu server in the ssh terminal and will automatically be closed if idle.

# What next

- clone git repos
  - git clone https://github.com/seetharampullela/mockDevTinder.git
  - git clone https://github.com/seetharampullela/mockDevTinder-web.git
- Install node using ssh ⬆️
  - curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
  - nvm install 20.20.1
- Follow official website (use curl)
- Caution: Please make sure the node versions must match with the cdone that is on your local computer

- Frontend
  - Install dependencies
  - npm run build
  - sudo apt update
  - sudo apt install nginx
  - nginx > Hosting site for front end
  - sudo systemctl start nginx - Dig deeper on what is it and all
  - sudo systemctl enable nginx
    Copy dist folder to var/www/html
  - sudo scp -r dist /var/www/html/
  - Now goto aws console and go to security setting and enable port :80

-Backend

- Install Dependencies
- allow ec2 instance public IP in mongodb network access
- add the port number (7777 in current case) in security setting in the ec2 instance
- npm start (add the script) - can't do this forever
- install pm2 (process manager) through npm for running the be server
- then do pm2 start npm -- start
- "pm2 logs" for the npm
- pm2 flush npm - to clear the logs
- pm2 list
- pm2 stop
- pm2 delete npm <name of process>
  Custom name for the npm process
- pm2 start npm --name "mydevserver" -- start

To Avoid the 7777 port we need to map it to some string > Standard is "api"
nginx config

- for this we need to edit the following file > sudo nano /etc/nginx/sites-available/default
  Add the following thing in the folder
  server {
  listen 80;
  server_name 13.61.151.199 // www.example.com example.com;
  <!-- location / {
              proxy_pass http://localhost:3000;
              proxy_set_header Host $host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto $scheme;
          } -->
  - Below location shall be placed to make sure 404 error doesn't occur for react browser routing. Observed this error while reloading /profile routes from browser. Like the react routes not working while app reload

  location / {
  try_files $uri /index.html;
  }

  location /api/ {
  proxy_pass http://localhost:7777/; # Pass the request to the Node.js
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
  }
  }

- restart nginx > sudo systemctl restart nginx

# Sending Email via Amazon AWS SES

- create a IAM user
- give access to AmazonSESFullAccess
- create an identity
- verify your domain name
- verify your email address
- Install @aws-sdk/client-ses
- GIT For Code Eg: https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/ses/src/ses_sendemail.js
- Access Credentials shall be configured in AWS IEM (identity and access managememnt) under security credentials tab.
  - add credentials to env file
- configure sesClient and sendEmail client
  - Just followed the above git link
- Configure connectionRequest api for sending the mail. Please make sure the sender should be based on the domain name and receipient mail address shall be verified in AWS SES.
- Make the params dynamic by passing more params to the run function

### Configure the signedup users mails ids to be added to the aws mail server by confirming their things

# Scheduling cron jobs (010426)

- npm i cron
- crontab.guru (website)
- Figure out sending bulk mails from AWS SES
- creating templates
- Exploring queue mechanisms
- Amazon templates
- Amazon SES bulk email
- Making sendEmail function dynamic
- bee-queue, bull packages for queing the work
