#!/bin/bash

export URL=https://github.com/CERIT-SC/kube-docs.git
export BRANCH=fumadocs

#docker run -it --rm -p 3000:3000 -e URL=$URL -e BRANCH=$BRANCH -e STARTPAGE=/en/docs/news $1
docker run -it --rm -p 3000:3000 -e STARTPAGE=/en/docs/news -v /home/xhejtman/kube-docs/content:/opt/fumadocs/content -v /home/xhejtman/kube-docs/public:/opt/fumadocs/public $1
