# MovePay Withdrawal Helper

A compact, movable Tampermonkey toolbar for the MovePay withdrawals list.

## Install

With Tampermonkey installed, open [Install the helper](https://raw.githubusercontent.com/akintomoon/movepay-withdrawal-helper/main/withdrawals-today.user.js) and confirm installation.

If you already have “MovePay Withdrawals — Today”, update that existing script. Keep only one enabled copy. Refresh MovePay after installation or an update.

## Controls

- **Вчера**: yesterday, 00:00:00–23:59:59, in your computer's timezone.
- **Сегодня**: today, 00:00:00–23:59:59, in your computer's timezone.
- **Остатки**: selects PARTIALLY_COVERED and CLOSED_WITH_BALANCE, replacing other statuses while preserving the date range.
- All three buttons select 100 rows per page and return to page 1. More than 100 results still require additional pages.
- Drag **⠿** to move the toolbar. Its position is remembered in this browser. Double-click the handle to reset it; arrow keys also move the focused handle.

Date buttons preserve the selected status filter. Dates are calculated when clicked; the filter does not roll over automatically at midnight.

The helper only changes list filters and pagination. It does not approve, reject or modify withdrawals, and does not send transaction data to GitHub. Tampermonkey contacts GitHub to retrieve script updates.

## Updates

Enable script update checks in Tampermonkey. Updates follow each user's settings and are not immediate. A manual update check can also be requested from Tampermonkey.

Maintainer: edit the same `withdrawals-today.user.js` on `main` and increase `@version` for every release. Keep `@name`, `@namespace`, file path, and update/download URLs stable so existing installations can update. Test changes before publishing: this file is the team's update source.

Current release: **1.2.1** — adds GitHub installation and update addresses; toolbar behaviour is unchanged from 1.2.0.
