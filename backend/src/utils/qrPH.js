/**
 * CRC16 CCITT calculation for EMVCo/QRPH
 * Polynomial: 0x1021, Initial: 0xFFFF
 */
const calculateCRC16 = (data) => {
    let crc = 0xFFFF;
    const bytes = Buffer.from(data, 'utf8');

    for (const byte of bytes) {
        crc ^= (byte << 8);
        for (let i = 0; i < 8; i++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = (crc << 1);
            }
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
};

/**
 * Parses EMVCo/QRPH TLV (Tag-Length-Value) format
 */
const parseTLV = (payload) => {
    const tags = {};
    let index = 0;

    while (index < payload.length) {
        const tag = payload.substring(index, index + 2);
        const length = parseInt(payload.substring(index + 2, index + 4), 10);
        const value = payload.substring(index + 4, index + 4 + length);

        if (isNaN(length)) break;

        tags[tag] = {
            length: length.toString().padStart(2, '0'),
            value
        };
        index += 4 + length;
    }
    return tags;
};

/**
 * Serializes tags back to EMVCo string and appends CRC
 */
const serializeTLV = (tags) => {
    let payload = '';
    
    // Sort tags to maintain standard order, but CRC (63) must be last
    const sortedTags = Object.keys(tags).sort().filter(t => t !== '63');
    
    for (const tag of sortedTags) {
        payload += `${tag}${tags[tag].length}${tags[tag].value}`;
    }

    // Add CRC tag placeholder
    payload += '6304';
    
    // Calculate CRC
    const crc = calculateCRC16(payload);
    return payload + crc;
};

module.exports = {
    calculateCRC16,
    parseTLV,
    serializeTLV
};
