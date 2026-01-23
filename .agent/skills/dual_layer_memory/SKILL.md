---
name: dual_layer_memory
description: Enables a persistent dual-layer (Short/Long term) memory system for the agent using local files.
---
# Dual-Layer Memory System

## Description
This skill forces the agent to utilize a file-based memory system (`memory/SHORT_TERM.md` and `memory/LONG_TERM.md`) instead of relying solely on the context window. This ensures context persistence across sessions.

## Instructions
1.  **Check for Memory Files**:
    - At the start of the session, check if `memory/SHORT_TERM.md` and `memory/LONG_TERM.md` exist in the root of the workspace.
    - If they do not exist, create them.
      - `LONG_TERM.md`: Initialize with `# Project Long Term Memory\n\n- [Rule] Always use modular code.`
      - `SHORT_TERM.md`: Initialize with `# Current Session\n\n- Status: Initialized`

2.  **Workflow Loop (Lazy Loading)**:
    - **Recall (Only when needed)**:
        - DO NOT read memory files on every turn.
        - Read `memory/SHORT_TERM.md` ONLY if:
            1. It is the very first turn of the conversation.
            2. The user asks for a status update.
            3. You are unsure about the current task or context.
    - **Execute**: Perform the user's request.
    - **Memorize (Batch Updates)**:
        - DO NOT update `SHORT_TERM.md` for minor steps.
        - Update `SHORT_TERM.md` ONLY when:
            1. A major task is completed.
            2. The session is about to end (user says "done", "bye", etc.).
            3. A critical decision or new rule is established.

3.  **Strict Rules**:
    - Do not rely on conversation history for critical project details if they are not in the memory files.
    - The memory files are the Single Source of Truth (SSOT).
    - **Privacy First**: The `memory/` folder MUST be git-ignored in the current workspace.

4.  **Memory Consolidation (Short -> Long)**:
    - **Trigger**: 
        - **Manual**: When the user says "Consolidate Memory" or "Archive Session".
        - **Automatic**: When a major project phase ends (e.g., "Setup" finished, moving to "Feature A").
    - **Action**:
        1. Review `SHORT_TERM.md`. 
        2. Move stable **Rules** and **Architecture** decisions discovered during the session to `LONG_TERM.md`.
        3. Move "Completed Tasks" from `SHORT_TERM.md` to a "Past Milestones" section in `LONG_TERM.md` (keep it brief).
        4. Clear/Reset `SHORT_TERM.md` for the next phase.
        5. Trigger a Cloud Sync (Push) after consolidation.

5.  **Cloud Sync (Replication)**:
    - **Objective**: Keep the local `memory/` folder in sync with the Private Data Repository.
    - **Mechanism**:
        - You cannot use `git push` directly on `memory/` because it is git-ignored locally.
        - Instead, you must use the **GitHub API** (via `python script` or similar) to fetch/update the contents of `memory/SHORT_TERM.md` and `memory/LONG_TERM.md` in the `PRIVATE_DATA_REPO`.
    - **Trigger**:
        - **Pull**: On Session Start (if memory is empty).
        - **Push**: On Session End (or Critical Milestone).
    - **Implementation**:
        - Use the provided `memory_client.py` script included in this skill folder.
        - **Command**: `python path/to/skill/memory_client.py [pull|push]`
        - Note: Ensure `GITHUB_TOKEN` and `PRIVATE_DATA_REPO` environment variables are set.

---

## 🔄 For /archive Command (Namespaced: /cc-arc)
When the user says `/archive` or the namespaced `/cc-arc`:
1.  **Analyze**: Look at `SHORT_TERM.md` and identify rules, critical decisions, or stable project facts.
2.  **Extract**: Port these items into the appropriate sections of `LONG_TERM.md`.
3.  **Cleanse**: Summarize completed tasks in `SHORT_TERM.md` and move them to a "History" or "Past Milestones" section in `LONG_TERM.md`.
4.  **Reset**: Wipe `SHORT_TERM.md` and re-initialize it for the new session/phase.
5.  **Sync**: Run `python path/to/skill/memory_client.py push` to update the cloud.
6.  **Report**: Inform the user that the memory has been consolidated and the system is now "Lean and Mean".

