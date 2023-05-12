#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"
TP='.*-(tp)-.*'

if [[ "$VERCEL_GIT_COMMIT_REF" =~ $TP ]] ; then
    echo "- Build can proceed, calling turbo-ignore"
    npx turbo-ignore
else
    echo "- Build cancelled"
    exit 0;
fi