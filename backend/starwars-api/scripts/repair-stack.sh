#!/usr/bin/env bash
# repair-stack.sh
#
# Make sure the starwars-api CloudFormation stack is in a state that `serverless deploy`
# can update. Runs automatically before every deploy (see .github/workflows/deploy.yml)
# and can be run by hand from a shell with AWS credentials (for example AWS CloudShell).
#
# Why this exists
# ---------------
# In October 2026 the stack got stuck in UPDATE_ROLLBACK_FAILED and every deploy failed with
# "Stack ... is in UPDATE_ROLLBACK_FAILED state and can not be updated". CloudFormation never
# leaves that state on its own: somebody has to call ContinueUpdateRollback (optionally
# skipping resources that cannot be rolled back) or delete the stack. This script does that.
#
# Required IAM permissions
# ------------------------
#   cloudformation:DescribeStacks, cloudformation:DescribeStackResources,
#   cloudformation:DescribeStackEvents, cloudformation:ContinueUpdateRollback
#   cloudformation:DeleteStack (only for RECREATE_STACK=true or a ROLLBACK_COMPLETE stack)
#
# Usage
# -----
#   STACK_NAME=starwars-api-dev AWS_REGION=us-east-1 bash scripts/repair-stack.sh
#   RECREATE_STACK=true bash scripts/repair-stack.sh   # nuclear option: the API URL changes

set -euo pipefail

STACK_NAME="${STACK_NAME:-starwars-api-dev}"
AWS_REGION="${AWS_REGION:-us-east-1}"
RECREATE_STACK="${RECREATE_STACK:-false}"
POLL_SECONDS=10
MAX_POLLS=90 # 15 minutes

# Everything human-readable goes to stderr so functions can return values on stdout.
log() { printf '[repair-stack] %s\n' "$*" >&2; }

cfn() { aws cloudformation "$@" --region "$AWS_REGION"; }

stack_status() {
  local out
  if out=$(cfn describe-stacks --stack-name "$STACK_NAME" \
    --query 'Stacks[0].StackStatus' --output text 2>&1); then
    echo "$out"
  elif grep -q "does not exist" <<<"$out"; then
    echo "DOES_NOT_EXIST"
  else
    log "describe-stacks failed: $out"
    exit 1
  fi
}

wait_until_settled() {
  local status i
  for ((i = 0; i < MAX_POLLS; i++)); do
    status=$(stack_status)
    case "$status" in
    *_IN_PROGRESS) sleep "$POLL_SECONDS" ;;
    *)
      echo "$status"
      return 0
      ;;
    esac
  done
  echo "TIMEOUT"
}

show_failed_events() {
  log "Most recent failed stack events (newest first):"
  cfn describe-stack-events --stack-name "$STACK_NAME" \
    --query "StackEvents[?contains(ResourceStatus, 'FAILED')].[Timestamp,LogicalResourceId,ResourceStatus,ResourceStatusReason]" \
    --output text 2>/dev/null | head -n 15 >&2 || true
}

failed_resources() {
  cfn describe-stack-resources --stack-name "$STACK_NAME" \
    --query "StackResources[?ResourceStatus=='UPDATE_FAILED'].LogicalResourceId" \
    --output text | tr '\t' '\n' | sed '/^None$/d;/^$/d'
}

continue_rollback() {
  # Arguments: logical IDs to skip (may be empty).
  if (($# > 0)); then
    log "Continuing the rollback and skipping resources that cannot roll back: $*"
    cfn continue-update-rollback --stack-name "$STACK_NAME" --resources-to-skip "$@" >/dev/null
  else
    log "Continuing the rollback ..."
    cfn continue-update-rollback --stack-name "$STACK_NAME" >/dev/null
  fi
  wait_until_settled
}

delete_stack() {
  log "Deleting stack $STACK_NAME ..."
  cfn delete-stack --stack-name "$STACK_NAME"
  cfn wait stack-delete-complete --stack-name "$STACK_NAME"
  log "Stack deleted. The next deploy creates a fresh stack with a NEW API Gateway URL."
}

main() {
  local status
  status=$(stack_status)
  log "Stack $STACK_NAME ($AWS_REGION) is in state: $status"

  if [[ "$RECREATE_STACK" == "true" && "$status" != "DOES_NOT_EXIST" ]]; then
    log "RECREATE_STACK=true was requested."
    show_failed_events
    delete_stack
    return 0
  fi

  if [[ "$status" == *_IN_PROGRESS ]]; then
    log "Another CloudFormation operation is running; waiting for it to finish ..."
    status=$(wait_until_settled)
    log "Stack settled in state: $status"
  fi

  case "$status" in
  DOES_NOT_EXIST | CREATE_COMPLETE | UPDATE_COMPLETE | UPDATE_ROLLBACK_COMPLETE | IMPORT_COMPLETE | IMPORT_ROLLBACK_COMPLETE)
    log "Stack is healthy; nothing to repair."
    ;;

  ROLLBACK_COMPLETE)
    # The very first CREATE failed. Such a stack is empty and CloudFormation refuses to update it.
    log "The initial stack creation had failed; the empty stack must be deleted before it can be created again."
    show_failed_events
    delete_stack
    ;;

  UPDATE_ROLLBACK_FAILED)
    show_failed_events
    status=$(continue_rollback)
    if [[ "$status" == "UPDATE_ROLLBACK_FAILED" ]]; then
      local -a skip=()
      mapfile -t skip < <(failed_resources)
      if ((${#skip[@]} > 0)); then
        status=$(continue_rollback "${skip[@]}")
      fi
    fi
    if [[ "$status" != "UPDATE_ROLLBACK_COMPLETE" ]]; then
      show_failed_events
      log "ERROR: the stack is still in state $status after ContinueUpdateRollback."
      log "Fix the failing resource in the AWS console, or run the workflow manually with recreate_stack=true."
      return 1
    fi
    log "Rollback finished; the stack can be deployed again."
    ;;

  *)
    show_failed_events
    log "ERROR: state $status cannot be repaired automatically (ROLLBACK_FAILED and DELETE_FAILED need manual cleanup in the AWS console)."
    return 1
    ;;
  esac
}

main "$@"
