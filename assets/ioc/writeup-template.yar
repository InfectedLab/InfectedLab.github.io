/*
 * The Black Forge — Writeup Template YARA stub
 * URL: https://infectedlab.github.io/posts/writeup-template.html
 * Bu dosya bir şablondur. Yeni bir otopsi yazdığında posts/<slug>/<slug>.yar
 * şeklinde kopyalayıp ilgili stringleri ve hash'leri doldur.
 */

import "hash"

rule The Black Forge_Behelit_Loader_Template
{
    meta:
        author      = "Kara Süvari (The Black Forge)"
        description = "Behelit-7B2A loader (Stage 1) — kurgu/şablon"
        date        = "2026-04-29"
        family      = "Behelit"
        tlp         = "WHITE"
        ref         = "https://infectedlab.github.io/posts/writeup-template.html"
        sample_sha256 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

    strings:
        $marker_id      = "Behelit-7B2A" wide ascii
        $marker_key     = "AAAA-BERSERK-KEY-AAAA" ascii
        $api_pattern    = { 48 8D 0D ?? ?? ?? ?? E8 ?? ?? ?? ?? 48 89 45 ?? }
        $c2_path        = "/api/v1/checkin?id=" ascii
        $ua             = "Behelit/1.0" ascii

    condition:
        uint16(0) == 0x5A4D and
        filesize < 2MB and
        2 of ($marker_*, $c2_path, $ua) and
        $api_pattern
}
