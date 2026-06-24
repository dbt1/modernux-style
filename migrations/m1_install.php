<?php
/**
 *
 * ModernUX. An extension for the phpBB Forum Software package.
 *
 * @copyright (c) 2026 Thilo Graf (dbt1)
 * @license GNU General Public License, version 2 (GPL-2.0-only)
 *
 */

namespace dbt\modernux\migrations;

/**
 * Installs the single config flag used as the go-live switch.
 * 0 = only opt-in testers (?modernux=1) see the overlay, 1 = everyone.
 */
class m1_install extends \phpbb\db\migration\migration
{
	public function effectively_installed()
	{
		return isset($this->config['modernux_force_all']);
	}

	public static function depends_on()
	{
		return ['\phpbb\db\migration\data\v330\v330'];
	}

	public function update_data()
	{
		return [
			['config.add', ['modernux_force_all', 0]],
		];
	}
}
