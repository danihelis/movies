#!/usr/bin/env python3

import argparse
import datetime
import re
import sys
import unicodedata
import functools
import json

from extract import slugify, Movie, Database


DATABASE_FILE = 'database.txt'


fields = ['meta', 'meta_user', 'rotten', 'rotten_user', 'imdb']

def load_database():
    database = Database()
    with open(DATABASE_FILE) as stream:
        for line in stream.readlines():
            match = re.match(r'^((\d{3}\s+){5})(D?)\s+\((\d{4})\)\s+(.+)$',
                             line.strip())
            if match:
                movie = database.get_or_create(match.group(5),
                                               int(match.group(4)))
                movie.documentary = match.group(3) == 'D'

                for field, value in zip(fields, match.group(1).split()):
                    setattr(movie, field, int(value))
    return database


if __name__ == '__main__':
    year = datetime.datetime.now().year
    parser = argparse.ArgumentParser()
    parser.add_argument('-y', '--by-years', action='store_true',
                        help='group by years')
    parser.add_argument('-p', '--progressive', action='store_true',
                        help='reserve slots for recent movies')
    parser.add_argument('-i', '--iterative', action='store_true',
                        help='select best year by year')
    parser.add_argument('-u', '--until', default=1900, type=int,
                        help='only movies until this year')
    parser.add_argument('-n', '--number', default=5, type=int,
                        help='number of years per group')
    parser.add_argument('-D', '--no-documentary', action='store_true',
                        help='exclude documentaries')
    parser.add_argument('-s', '--sort',
                        choices=['year', 'score'],
                        help='sort results instead of showing groups')
    parser.add_argument('-j', '--json', action='store_true',
                        help='export data to json')
    args = parser.parse_args()

    database = load_database()

    if not args.json:
        print('> Loaded', len(database), 'movies')

    if not (args.by_years or args.iterative):
        movies = database.filter(year_start=args.until)
        if not args.json:
            for i, m in enumerate(movies):
                print('%3d.' % (i + 1), m)
    else:
        total_years = 100
        stride = 1 if args.iterative else args.number
        selected = stride
        progressive = []
        total = 0

        displayed = []
        for index in range(0, total_years, stride):
            end = year - index
            start = end - stride + 1

            if index + stride >= total_years:
                start = 1900 # get all oldies

            start = max(start, args.until)
            if start - stride < args.until:
                start = args.until
            if end - start < stride - 1:
                break

            movies = database.filter(start, end,
                                     exclude_documentaries=args.no_documentary)

            if args.progressive:
                progressive += movies
                movies = progressive

            movies = sorted(movies,
                            key=lambda m: (m.score, m.year),
                            reverse=True)

            if args.iterative or args.progressive:
                movies = movies[:stride]

            if movies:
                if not args.sort and not args.json:
                    if not args.iterative:
                        if args.progressive:
                            print('--- FROM', start, 'AND ON ---')
                        else:
                            print('---', start, 'TO', end, '---')

                    for i, m in enumerate(movies):
                        print('%3d.' % (total + i + 1), m)

                    if args.iterative or args.progressive:
                        total += len(movies)
                    if not args.iterative:
                        print()

                displayed += movies

                if args.progressive:
                    progressive = [m for m in progressive if m not in movies]

        movies = displayed
        if args.sort and not args.json:
            movies.sort(
                key=lambda m: (
                    (m.year, m.score) if args.sort == 'year' else
                    (m.score, m.year)
                ),
                reverse=True)
            for i, m in enumerate(movies):
                print('%3d.' % (i + 1), m)

    if args.json:
        data = [m.as_dict() for m in movies]
        print(json.dumps(data, indent=2))
