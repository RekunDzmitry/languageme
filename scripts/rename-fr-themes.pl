#!/usr/bin/env perl
# Rename FR theme IDs from "themeNN" to "fr_themeNN" in JS/JSX files.
# Skips already-prefixed IDs (pl_theme, fr_theme, ge_theme, esp_theme, etc.)
# by requiring a word boundary on the left: themeNN must not be preceded
# by a word character (letters/digits/underscore).
#
# Run from the worktree root.

use strict;
use warnings;

my @files = (
    'src/utils/progress.js',
    'src/data/courses/fr/vocab.js',
    'src/data/courses/fr/themes/theme01-pronouns-present.js',
    'src/data/courses/fr-pl/vocab.js',
    'src/data/courses/fr-pl/themes/theme01-pronouns-present.js',
    'src/pages/LearnPage.jsx',
    'src/pages/TrainingPage.jsx',
);

for my $f (@files) {
    open(my $in, '<', $f) or die "open $f: $!";
    local $/;
    my $content = <$in>;
    close($in);

    my $before = $content;
    # Match a quoted or backticked themeNN where theme is not preceded by a word char.
    # \b doesn't work well across the boundary to "_", so use a negative lookbehind via \K trick:
    # (?<![A-Za-z0-9_])(['"`])(theme)(\d{2,})\1
    $content =~ s/(?<![A-Za-z0-9_])(['"`])(theme)(\d{2,})\1/${1}fr_${2}${3}${1}/g;

    if ($content ne $before) {
        open(my $out, '>', $f) or die "write $f: $!";
        print $out $content;
        close($out);
        my $count = () = ($before =~ m/(?<![A-Za-z0-9_])(['"`])(theme)(\d{2,})\1/g);
        print "$f: $count renames\n";
    } else {
        print "$f: no change\n";
    }
}
