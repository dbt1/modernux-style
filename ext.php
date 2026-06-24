<?php
/**
 *
 * ModernUX. An extension for the phpBB Forum Software package.
 *
 * @copyright (c) 2026 Thilo Graf (dbt1)
 * @license GNU General Public License, version 2 (GPL-2.0-only)
 *
 */

namespace dbt\modernux;

/**
 * Extension entry point.
 *
 * Default behaviour (enable/disable/purge) from the base class is sufficient:
 * the extension only injects assets via template events and adds one config row.
 */
class ext extends \phpbb\extension\base
{
	/**
	 * Only allow enabling on phpBB 3.3.x.
	 *
	 * @return bool|string True if enableable, otherwise a phrase/string why not.
	 */
	public function is_enableable()
	{
		return phpbb_version_compare(PHPBB_VERSION, '3.3.0', '>=')
			&& phpbb_version_compare(PHPBB_VERSION, '4.0.0', '<');
	}
}
