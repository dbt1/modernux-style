<?php
/**
 *
 * ModernUX. An extension for the phpBB Forum Software package.
 *
 * @copyright (c) 2026 Thilo Graf (dbt1)
 * @license GNU General Public License, version 2 (GPL-2.0-only)
 *
 */

namespace dbt\modernux\event;

use phpbb\config\config;
use phpbb\path_helper;
use phpbb\request\request_interface;
use phpbb\template\template;
use phpbb\user;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Injects the ModernUX CSS/JS into the active style via template events.
 *
 * Activation is gated so the overlay can be tested on the live board without
 * affecting normal visitors:
 *   - go-live for everyone:  config 'modernux_force_all' = 1
 *   - opt-in preview:        ?modernux=1 (persisted in a phpBB-prefixed cookie),
 *                            disable again with ?modernux=0
 */
class main_listener implements EventSubscriberInterface
{
	/** Bump when the CSS/JS assets change (cache-buster, independent of the style version). */
	const ASSET_VERSION = '0.1.0';

	/** @var config */
	protected $config;

	/** @var request_interface */
	protected $request;

	/** @var user */
	protected $user;

	/** @var path_helper */
	protected $path_helper;

	/** @var template */
	protected $template;

	public function __construct(config $config, request_interface $request, user $user, path_helper $path_helper, template $template)
	{
		$this->config      = $config;
		$this->request     = $request;
		$this->user        = $user;
		$this->path_helper = $path_helper;
		$this->template    = $template;
	}

	/**
	 * {@inheritdoc}
	 */
	public static function getSubscribedEvents()
	{
		return [
			'core.page_header' => 'inject_assets',
		];
	}

	/**
	 * Assign the asset URLs + the activation flag for the header/footer event templates.
	 */
	public function inject_assets()
	{
		if (!$this->is_active())
		{
			return;
		}

		$base = $this->path_helper->get_web_root_path() . 'ext/dbt/modernux/styles/all/theme/';

		$this->template->assign_vars([
			'S_MODERNUX_ACTIVE' => true,
			'MODERNUX_CSS'      => $base . 'modernux.css?v=' . self::ASSET_VERSION,
			'MODERNUX_JS'       => $base . 'modernux.js?v=' . self::ASSET_VERSION,
		]);
	}

	/**
	 * Decide whether the overlay is active for the current request.
	 *
	 * @return bool
	 */
	protected function is_active()
	{
		// Go-live switch: active for everyone.
		if (!empty($this->config['modernux_force_all']))
		{
			return true;
		}

		// Opt-in toggle via URL: ?modernux=1 enables, ?modernux=0 disables; persisted in a cookie.
		if ($this->request->is_set('modernux'))
		{
			$optin = (bool) $this->request->variable('modernux', 0);
			// phpBB prefixes the cookie name with $config['cookie_name'] automatically.
			$this->user->set_cookie('modernux', $optin ? '1' : '0', $optin ? (time() + 31536000) : 1);
			return $optin;
		}

		// Persisted opt-in: read the phpBB-prefixed cookie.
		$cookie_name = $this->config['cookie_name'] . '_modernux';
		return (bool) $this->request->variable($cookie_name, 0, false, request_interface::COOKIE);
	}
}
