export interface NetworkInfo {
    name: string;
    uuid: string;
    type: string;
    device: string
}

export function getNetworkInfoFromConnections(content: string): NetworkInfo[] {
    // console.log({content});
    const lines = content.split('\n');
    const titles = lines[0].trim().split(/\s{2,}/);
    const data = lines.slice(1);

    const result: NetworkInfo[] = data.map((line) => {
        const values = line.trim().split(/\s{2,}/);
        const obj: NetworkInfo = {} as NetworkInfo;
        titles.forEach((title, index) => {
            obj[title.toLowerCase() as keyof NetworkInfo] = values[index];
        });
        return obj;
    });

    return result;
}