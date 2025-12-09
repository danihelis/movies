#!/usr/bin/env python3

import argparse
import datetime
import re
import sys
import unicodedata


IMDB_FILE = 'imdb.txt'
ROTTEN_FILE = 'rotten.txt'
META_FILE = 'meta.txt'


def slugify(text):
    text = ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if not unicodedata.combining(c)
    )
    return re.sub(r'\W+', '-', text.lower().strip())


class Movie:

    def __init__(self, database, id, name, year):
        self.database = database
        self.id = id
        self.name = name
        self.year = year
        self.imdb = None
        self.rotten = None
        self.meta = None
        self.rotten_user = None
        self.meta_user = None
        self.documentary = False

    def as_dict(self):
        fields = ['id', 'name', 'year', 'imdb', 'rotten', 'meta', 'rotten_user',
                  'meta_user', 'documentary', 'score']
        return {f: getattr(self, f) for f in fields}

    @property
    def score(self):
        return sum(
            getattr(self, value, 0) or 0
            for value in ['imdb', 'rotten', 'rotten_user', 'meta', 'meta_user']
        ) / 5

    def get_score(self, score='all'):
        match score:
            case 'all':
                return self.score
            case 'imdb' | 'rotten' | 'rotten_user' | 'meta' | 'meta_user':
                return getattr(self, score) or 0
        return 0

    @property
    def _score_display(self):
        return '|'.join(
            '%02d' % (value % 100) if value is not None else '--'
            for value in [self.meta, self.meta_user, self.rotten, self.rotten_user,
                          self.imdb]
        )

    @property
    def short_name(self):
        limit = 60
        if len(self.name) > limit:
            return self.name[:limit - 1] + '…'
        return self.name

    def __str__(self):
        return '%4d  %s (%4.1f)  %s' % (
            self.year, self._score_display, self.score, self.short_name)

    def format_for_import(self):
        score = ''
        for s in ['meta', 'meta_user', 'rotten', 'rotten_user', 'imdb']:
            value = getattr(self, s, None)
            value = '%03d' % value if value else '0..'
            score += f'{value} '
        return f'{score}{'D' if self.documentary else ' '} ({self.year}) {self.name}'


class Database:

    def __init__(self):
        self.movies = {}

    def __len__(self):
        return len(self.movies)

    def get_or_create(self, name, year):
        id = slugify(name)
        movie = self.movies.get(id) or Movie(self, id, name, year)
        if id not in self.movies:
            self.movies[id] = movie
        return movie

    def filter(self, year_start=1800, year_end=3000, score='all',
               exclude_documentaries=False):
        movies = filter(lambda m: (year_start <= m.year <= year_end and
                                   not (exclude_documentaries and m.documentary)),
                        self.movies.values())
        return sorted(list(movies),
                      key=lambda m: (m.get_score(score), m.year),
                      reverse=True)


def extract_imdb(database):
    count = 0
    with open(IMDB_FILE) as stream:
        lines = stream.readlines()
        index = 0
        while index + 5 <= len(lines):
            name = lines[index + 2].strip()
            year = int(lines[index + 3][:4])
            movie = database.get_or_create(name, year)
            movie.imdb = int(float(lines[index + 4].split()[0]) * 10)
            index += 5
            count += 1
    print('> Loaded', count, 'movies from', IMDB_FILE)


def extract_rotten(database):
    count = 0
    with open(ROTTEN_FILE) as stream:
        for line in stream.readlines():
            match = re.match(r'^(\d+)% (.+) \((\d+)\)$', line.strip())
            if match:
                name = match.group(2)
                year = int(match.group(3))
                movie = database.get_or_create(name, year)
                movie.rotten = int(match.group(1))
                count += 1

    print('> Loaded', count, 'movies from', ROTTEN_FILE)

def extract_meta(database):
    count = 0
    skipped = 0
    with open(META_FILE) as stream:
        lines = stream.readlines()
        index = 0
        while index < len(lines):
            match = re.match(r'^%s. ([^(]+)\s*(\([^)]+\))?$' % (count + 1),
                             lines[index].strip())
            if not match:
                index += 1
                continue

            name = match.group(1)
            extra = match.group(2)
            if extra == '(SKIP)':
                index += 1
                count += 1
                skipped += 1
                continue
            #if extra:
            #    print('!!!', count, name, extra)

            try:
                year = int(lines[index + 1].split()[2])
            except:
                print('--- ERROR ---')
                print(*lines[index: index + 5])
                raise

            movie = database.get_or_create(name, year)
            movie.meta = int(lines[index + 3])
            count += 1
            index += 4

    print('> Loaded', count, 'movies from', META_FILE, '(skipped %d)' % skipped)


if __name__ == '__main__':
    year = datetime.datetime.now().year
    parser = argparse.ArgumentParser()
    parser.add_argument('-s', '--start', default=1900, type=int,
                        help='first year of selected period')
    parser.add_argument('-e', '--end', default=year, type=int,
                        help='last year of selected period')
    parser.add_argument('-n', '--number', default=20, type=int,
                        help='maximum movies to list')
    parser.add_argument('-c', '--criteria',
                        choices=['imdb', 'rotten', 'meta', 'all'],
                        default='all',
                        help='ranking criteria to sort')
    parser.add_argument('-x', '--export', type=argparse.FileType('w'),
                        help='output file')
    args = parser.parse_args()

    database = Database()
    extract_imdb(database)
    extract_rotten(database)
    extract_meta(database)
    print('> Database has', len(database.movies), 'movies')

    movies = database.filter(args.start, args.end, args.criteria)
    print('--- Movies from', args.start, 'to', args.end, '---')
    for index, movie in enumerate(movies):
        if index >= args.number:
            print('... plus other', len(movies) - args.number, 'movies')
            break
        print('%3d.' % (index + 1), movie)

    if args.export:
        stream = args.export

        total_years = 100
        stride = 5

        start_index = 10
        selected = 5

        from compute import load_database
        try:
            existent = load_database()
        except:
            existent = Database()

        for index in range(0, total_years, stride):
            end = year - index
            start = end - stride + 1

            if index + stride >= total_years:
                start = 1900 # get all oldies

            movies_list = {
                m.id: m
                for m in existent.filter(start, end)
            }

            for c in ['imdb', 'rotten', 'meta']:
                movies = database.filter(start, end, c)
                movies = movies[start_index : start_index + selected]
                movies = [m for m in movies if m.id not in existent.movies]
                movies_list.update({m.id: m for m in movies})

            print('---', start, 'TO', end, '---', file=stream)
            movies = sorted(movies_list.values(), key=lambda m: m.name)
            for i, m in enumerate(movies):
                print(m.format_for_import(), file=stream)
            print(file=stream)
