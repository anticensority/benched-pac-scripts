# Generate PAC Script

`node pac-generator cut|nocut ./new-gen/global-in.js > ./new-pac/global-in.pac`  
`node pac-generator.js nocut ./new-gen/bloom.js > bloom.pac`

# Test PAC Script

`node test.js ./new-pac/global-in.pac`

# Bench PAC Script

I think it's better to launch tests one by one (not in butch).

`./node bench.js ./new-pac/global-in.pac`

If you think it runs too many cycles -- edit bench.js.

# Statistics

See stats.txt and stats2.txt.

## Number of Hosts Per First Letter

m 3390
s 3008
k 2892
p 2751
a 2084
r 2076
b 2028
v 2002
c 1946
l 1684
g 1647
d 1463
1 1235
t 1147
f 1061
n 981
w 953
i 908
o 783
e 656
h 515
x 502
j 468
z 402
u 377
2 364
7 264
y 190
3 123
0 107
8 91
4 91
5 89
6 88
9 49
q 45
