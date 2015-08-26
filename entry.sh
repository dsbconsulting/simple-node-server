#!/bin/sh

printf "\n
[nodelog]\n
file = /var/log/gs/server.log\n
buffer_duration = 5000\n
initial_position = start_of_file\n
log_group_name = /app/gs/source2/dev\n" >> /var/awslogs/etc/awslogs.conf

if ([ ! -z $CW_LOGS_APP_ENV ])
then
	printf "log_stream_name = /gs/node-serv/${CW_LOGS_APP_ENV}/{hostname}/{instance_id}\n" >> /var/awslogs/etc/awslogs.conf
else
	printf "log_stream_name = /gs/node-serv/x/{hostname}/{instance_id}\n" >> /var/awslogs/etc/awslogs.conf
fi

supervisord
