#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"
tp = '*-[tp]-*'

if [[ "$VERCEL_GIT_COMMIT_REF" =~ $tp ]] ; then
    echo "- Build can proceed"
    exit 1;
else
    echo "- Build cancelled"
    exit 0;
fi