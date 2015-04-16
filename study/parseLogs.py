import sys

def sanitizeLogs(raw, clean):
	with open(raw) as r:
		lines = r.readlines()
	with open(clean, 'w') as c:
		for line in lines:
			if 'editBSElement-edit' in line:
				c.write(line)

def extractUsers(clean):
	users = set()
	with open(clean) as c:
		lines = c.readlines()
	for line in lines:
		tokens = line.split()
		users.add(tokens[6])
	return users

def matchFinalCode(users, clean, matched):
	matchedCode = {}
	with open(clean) as c:
		lines = c.readlines()
	for user in users:
		matchedCode[user] = {}
		for line in lines:
			if user in line:
				tokens = line.split()
				idxURL = tokens.index('URL:')
				url = tokens[idxURL+1]
				code = tokens[10:idxURL]
				matchedCode[user][url] = {}
				matchedCode[user][url]['timestamp'] = tokens[1] + ' ' + tokens[2]
				matchedCode[user][url]['code'] = ' '.join(code)
	with open(matched, 'w') as m:
		for user in matchedCode.keys():
			m.write(user)
			m.write('\n')
			m.write('====================')
			m.write('\n')
			for url in matchedCode[user].keys():
				m.write('URL: ')
				m.write(url)
				m.write('\n')
				m.write('Timestamp: ')
				m.write(matchedCode[user][url]['timestamp'])
				m.write('\n')
				m.write('Code: ')
				m.write(matchedCode[user][url]['code'])
				m.write('\n')
				m.write('\n')
			m.write('\n')



def main():
	raw = sys.argv[1]
	clean = sys.argv[2]
	matched = sys.argv[3]
	sanitizeLogs(raw, clean)
	users = extractUsers(clean)
	matchedCode = matchFinalCode(users, clean, matched)
	print matchedCode



main()