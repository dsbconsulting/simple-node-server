FROM node:0.10-slim

WORKDIR /home/mean

RUN apt-get update && apt-get install -y git-core gcc make build-essential python-pip python-dev supervisor wget

# Install Mean.JS Prerequisites
RUN npm install -g bower grunt-cli

# Install Mean.JS packages
ADD package.json /home/mean/package.json
RUN npm install --production

# Manually trigger bower. Why doesnt this work via npm install?
ADD .bowerrc /home/mean/.bowerrc
ADD bower.json /home/mean/bower.json
RUN bower install --config.interactive=false --allow-root

# Make everything available for start
ADD . /home/mean

# Prepare for production
RUN grunt build

# Remove build helpers
RUN apt-get purge -y --auto-remove git-core gcc make build-essential

ENV NODE_ENV production
ENV DB_ADDR 127.0.0.1

# AWS keys
ENV ACCESS_KEY_ID key
ENV SECRET_ACCESS_KEY secret

# Clould Watch AWS Logs
ENV CW_LOGS_AWS_API_KEY key
ENV CW_LOGS_AWS_API_SECRET secret
RUN mkdir -p /root/.aws
RUN echo "[default]\n\
aws_access_key_id = ${CW_LOGS_AWS_API_KEY}\n\
aws_secret_access_key = ${CW_LOGS_AWS_API_SECRET}" > /root/.aws/credentials
RUN wget https://s3.amazonaws.com/aws-cloudwatch/downloads/latest/awslogs-agent-setup.py

RUN echo "aws_access_key_id = ${CW_LOGS_AWS_API_KEY}\n\
aws_secret_access_key = ${CW_LOGS_AWS_API_SECRET}" > /root/.aws/credentials

RUN mkdir -p /var/log/alfred
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Port 3000 for server
EXPOSE 3000
CMD ["bash","./entry.sh"]

