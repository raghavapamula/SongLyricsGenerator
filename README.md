# SongLyricsGenerator

# How it works
The application Uses Markov Chains to generate lyrics in the style of existing artists.

# Getting Data
The app takes user input in the form of an artist's name, and makes two chained GET requests to MusixMatch's API: one to get all available track id's for that artist, and the second to use the track id's to pull the actual lyrics.

# Cleaning Data
Boring stuff. We use regex to remove text in paranthesis because its usually not lyrics, use regex to add spaces before punctuation so that they can be counted as words when parsing, etc.

# Transforming The Data
We build a word association graph by using a javascript object of lists, where each word is mapped to words that were found immediately after, and not necessarily uniquely (A word can be mapped to multiple instances of the same next word). We also keep track of the words that were used to start sentences and the average track length in terms of lines.

# The Transformed Data
The Markov Chain has a fairly accurate representation of the probability that a word in a line comes after another word. Each word is mapped to all the words that the algorithm has seen come after it, and duplicates are allowed. This means that by using a uniform random number to index the array of possible next elements for word, we get a uniform distribution of probabilities for the next word.

# Generation
We generate a uniform random number using Math.random() and index the corresponding track number and choose its length. We generate the result's number of lines. For each line, we use the same process to select a starting word at random, and we traverse through the markov chain to get subsequent words. We stop when we reach a period, the current word reached has no associated "next" words, or the length of the current sentence is 15.

# Reflection
Turns out, markov chains aren't the best heuristic for generating "meaningful" lyrics. But the resulting lyrics can usually still be comprehended and are really interesting! Maybe I'll use a neural net next time.