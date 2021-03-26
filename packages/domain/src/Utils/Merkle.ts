import sha256 from "crypto-js/sha256";

export function merkle(hashList: string[]): string {
  let length = hashList.length;
  if (length === 1) {
    return hashList[0];
  }

  let oddHash: string | undefined;
  if (length % 2 === 1) {
    oddHash = hashList.pop();
    length--;
  }

  const newHashList: string[] = [];
  for (let i = 0; i < length; i += 2) {
    newHashList.push(sha256(`${hashList[i]}${hashList[i + 1]}`).toString());
  }

  if (oddHash) {
    newHashList.push(sha256(`${oddHash}${oddHash}`).toString());
  }

  return merkle(newHashList);
}

export function hash(val: object | string): string {
  if (typeof val === "string") {
    return sha256(val).toString();
  }
  return sha256(JSON.stringify(val)).toString();
}
