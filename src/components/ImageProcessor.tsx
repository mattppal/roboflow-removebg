import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const ImageProcessor: React.FC = () => {
    const [image, setImage] = useState<string | null>(null)
    const [processedImage, setProcessedImage] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith("image/")) {
            const imageUrl = URL.createObjectURL(file)
            setImage(imageUrl)
            await processImage(imageUrl)
        }
    }

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith("image/")) {
            const imageUrl = URL.createObjectURL(file)
            setImage(imageUrl)
            await processImage(imageUrl)
        }
    }

    const processImage = async (imageUrl: string) => {
        setIsProcessing(true)
        try {
            const response = await fetch('https://detect.roboflow.com/infer/workflows/matt-palmer/remove-background', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: import.meta.env.VITE_ROBOFLOW_API_KEY,
                    inputs: {
                        image: { type: "url", value: imageUrl },
                    },
                }),
            })

            if (!response.ok) {
                throw new Error('API request failed')
            }

            const data = await response.json()
            // Assuming the API returns the processed image URL in the response
            setProcessedImage(data.output_url) // Adjust this based on the actual API response structure
        } catch (error) {
            console.error('Error processing image:', error)
            // Handle error (e.g., show an error message to the user)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardContent className="p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold mb-4">Image Background Remover</h2>
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    >
                        <AnimatePresence>
                            {!image && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                                    <p className="text-gray-500">
                                        Drag and drop an image here, or click to select
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileInput}
                                        className="hidden"
                                        id="fileInput"
                                    />
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => document.getElementById("fileInput")?.click()}
                                    >
                                        Select Image
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <AnimatePresence>
                        {image && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="mt-8 grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Original Image</h3>
                                    <img src={image} alt="Original" className="w-full rounded-lg" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Processed Image</h3>
                                    {isProcessing ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="animate-spin" size={48} />
                                        </div>
                                    ) : processedImage ? (
                                        <img src={processedImage} alt="Processed" className="w-full rounded-lg" />
                                    ) : null}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </CardContent>
        </Card>
    )
}

export default ImageProcessor
