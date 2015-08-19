#!/bin/bash
SEARCHTEXT="TODO"
ROOT=$(git rev-parse --show-toplevel)
OUTFILE="todo.md"
EXCLUDE=''

while getopts "ohlf:t:e:i:" option; do
    case $option in
        'o' )
            STDOUT=true
        ;;
        'h' )
            echo "$(basename $0) - generate a todo file based on your code"
            echo "---"
            echo    "  -h - display this help"
            echo -n "  -l - LIVE MODE this will add the generated file to your "
            echo    "staged changes."
            echo -n "       Use this in the git hook. Off by default "
            echo    "for playing around in the terminal"
            echo    "  -o - print output to STDOUT"
            echo -n "  -f - write to this file (defaults to todo.md and path "
            echo    "starts at the repo's root)"
            echo    "  -t - text to search for (defaults to TODO)"
            echo    "  -e - exclude pattern"
            echo    "  -i - include patter"
            exit
        ;;
        'l' )
            LIVEMODE=true
        ;;
        'f' )
            OUTFILE=$OPTARG
        ;;
        't' )
            SEARCHTEXT=$OPTARG
        ;;
        'e' )
            EXCLUDE="$EXCLUDE$OPTARG|"
        ;;
        'i' )
            if [[ -z $INCLUDE ]]; then
                INCLUDE=$OPTARG
            else
                INCLUDE="$INCLUDE|$OPTARG"
            fi
        ;;
    esac
done

if [[ $INCLUDE ]] && [[ $EXCLUDE ]]; then
    echo "-i and -e can't be used together!"
    exit 1
fi

EXCLUDE=$EXCLUDE$OUTFILE

if [ $STDOUT ] && [ $LIVEMODE ]; then
    echo "-o and -l can't be used together! Ignoring -l" >&2
    unset LIVEMODE
fi

OUTFILE="$ROOT/$OUTFILE"
if [ -z $STDOUT ]; then
    exec 1>$OUTFILE
fi

echo "## To Do"

current_file=''
if [[ -z $INCLUDE ]]; then
    IFS=$'\r\n' tasks=($(git grep -In --full-name $SEARCHTEXT $ROOT | egrep -v "($EXCLUDE)"))
else
    IFS=$'\r\n' tasks=($(git grep -In --full-name $SEARCHTEXT $ROOT | egrep "($INCLUDE)"))
fi
# -I - skip binaries
# -n - include line numbers
# --full-name - the full path (starting from the repo root)

for task in ${tasks[@]}; do
    file=$(echo $task | cut -f1 -d':')
    line=$(echo $task | cut -f2 -d':')
    item=$(echo $task | cut -f3- -d':' | sed "s/.*$SEARCHTEXT *//g")

    if [[ $file != $current_file ]]; then
        if [ $current_file ]; then
            echo
        fi
        current_file=$file
        echo "### \`\`$current_file\`\`"
    fi
    echo "(line $line) $item"
    echo
done

echo "######Generated using [todo.md](https://github.com/charlesthomas/todo.md)"

if [ -z $LIVEMODE ]; then
    exit
fi

$(git add $OUTFILE)
