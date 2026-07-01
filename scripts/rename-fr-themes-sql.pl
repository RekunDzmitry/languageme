#!/usr/bin/env perl
# Rename bare themeNN -> fr_themeNN in SQL migrations.
# Skip rows that are already prefixed (pl_theme*, fr_theme*, ge_theme*, esp_theme*).
use strict;
use warnings;

my @files = (
    'server/src/db/migrations/003_seed_themes.sql',
    'server/src/db/migrations/004_seed_stem_changing_verbs.sql',
);

for my $f (@files) {
    open(my $in, '<', $f) or die "open $f: $!";
    local $/;
    my $content = <$in>;
    close($in);

    my $before = $content;
    # Match a quoted themeNN (opening + closing quote) not preceded by a word char
    # (so pl_themeNN stays put). Replace the matched quote-pair with fr_-prefixed
    # equivalent. The negative look-behind also guards against fr_themeNN we
    # already wrote.
    $content =~ s/(?<![A-Za-z0-9_])'(theme)(\d{2,})'/'fr_${1}${2}'/g;

    if ($content ne $before) {
        open(my $out, '>', $f) or die "write $f: $!";
        print $out $content;
        close($out);
        my $count = () = ($before =~ m/(?<![A-Za-z0-9_])'(theme)(\d{2,})'/g);
        print "$f: $count renames\n";
    } else {
        print "$f: no change\n";
    }
}
