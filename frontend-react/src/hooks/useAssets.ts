import { useState, useEffect } from 'react';
import { MapData } from '../types';

interface AssetsState {
    mapData: MapData | null;
    spriteSheet: HTMLImageElement | null;
    characterSheet: HTMLImageElement | null;
    loading: boolean;
    error: string | null;
}

export const useAssets = () => {
    const [assets, setAssets] = useState<AssetsState>({
        mapData: null,
        spriteSheet: null,
        characterSheet: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const loadAssets = async () => {
            try {
                setAssets(prev => ({ ...prev, loading: true, error: null }));

                // Load map data
                const mapResponse = await fetch('/map.json');
                if (!mapResponse.ok) {
                    throw new Error(`Failed to load map.json: ${mapResponse.status}`);
                }
                const mapData = await mapResponse.json();

                // Load images
                const loadImage = (src: string): Promise<HTMLImageElement> => {
                    return new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                        img.src = src;
                    });
                };

                const [spriteSheet, characterSheet] = await Promise.all([
                    loadImage('/spritesheet.png'),
                    loadImage('/Characters.png')
                ]);

                setAssets({
                    mapData,
                    spriteSheet,
                    characterSheet,
                    loading: false,
                    error: null
                });

            } catch (error) {
                console.error('Error loading assets:', error);
                setAssets(prev => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Unknown error loading assets'
                }));
            }
        };

        loadAssets();
    }, []);

    return assets;
}; 