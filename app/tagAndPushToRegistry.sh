#!/bin/bash

echo -e "#------ Building images\n"

docker compose build 
if [ $? -ne 0 ]; then
  echo -e "\tFailed to build images. Exiting."
  exit 1
fi

echo -e "\tImages built successfully\n"

echo -e "#------ Tagging images\n"

for img in fullapp-application fullapp-server
do 
  docker tag $img:latest 127.0.0.1:5000/$img:latest
  echo -e "\tImage $img tagged successfully"
done


echo -e "\n#------ Pushing images to registry\n"
for img in 127.0.0.1:5000/fullapp-application 127.0.0.1:5000/fullapp-server
do 
  docker push $img
  if [ $? -eq 0 ]; then
    echo -e "\tImage $img pushed successfully"
  else
    echo -e "\tFailed to push image $img"
  fi
done

echo -e "\n###------ Images Tagged and pushed to registry successfully"

