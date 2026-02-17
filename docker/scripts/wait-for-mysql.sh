#!/bin/sh
# Wait for MySQL to be ready

set -e

host="$1"
shift
cmd="$@"

until mysqladmin ping -h "$host" -u "${MYSQL_USER:-app_user}" -p"${MYSQL_PASSWORD:-app_password}" --silent; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 2
done

>&2 echo "MySQL is up - executing command"
exec $cmd
