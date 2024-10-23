import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Loader2, Download, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const ImageProcessor: React.FC = () => {
    const [image, setImage] = useState<File | null>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [processedImage, setProcessedImage] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        return () => {
            // Clean up temporary image when component unmounts
            if (imageUrl) {
                deleteTempImage(imageUrl)
            }
        }
    }, [imageUrl])

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith("image/")) {
            await handleImage(file)
        }
    }

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith("image/")) {
            await handleImage(file)
        }
    }

    const handleImage = async (file: File) => {
        // Clean up previous temporary image if exists
        if (imageUrl) {
            await deleteTempImage(imageUrl)
        }

        const formData = new FormData()
        formData.append('image', file)

        try {
            const response = await fetch('/api/upload-temp-image', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to upload image')
            }

            const data = await response.json()
            setImage(file)
            setImageUrl(data.imageUrl)
            await processImage(data.imageUrl)
        } catch (error) {
            console.error('Error uploading image:', error)
            // Handle error (e.g., show an error message to the user)
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
            setProcessedImage(data.output_url) // Adjust this based on the actual API response structure
        } catch (error) {
            console.error('Error processing image:', error)
            // Handle error (e.g., show an error message to the user)
        } finally {
            setIsProcessing(false)
        }
    }

    const deleteTempImage = async (imageUrl: string) => {
        try {
            await fetch('/api/delete-temp-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl }),
            })
        } catch (error) {
            console.error('Error deleting temporary image:', error)
        }
    }

    const handleDownload = () => {
        if (processedImage) {
            const link = document.createElement('a')
            link.href = processedImage
            link.download = 'processed_image.png'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const handleCopy = async () => {
        if (processedImage) {
            try {
                const response = await fetch(processedImage)
                const blob = await response.blob()
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ])
                alert('Image copied to clipboard!')
            } catch (error) {
                console.error('Error copying image:', error)
                alert('Failed to copy image to clipboard')
            }
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
                                    <img src={imageUrl || ''} alt="Original" className="w-full rounded-lg" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Processed Image</h3>
                                    {isProcessing ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="animate-spin" size={48} />
                                        </div>
                                    ) : processedImage ? (
                                        <>
                                            <img src={processedImage} alt="Processed" className="w-full rounded-lg mb-4" />
                                            <div className="flex justify-center space-x-4">
                                                <Button onClick={handleDownload}>
                                                    <Download className="mr-2 h-4 w-4" /> Download
                                                </Button>
                                                <Button onClick={handleCopy}>
                                                    <Copy className="mr-2 h-4 w-4" /> Copy
                                                </Button>
                                            </div>
                                        </>
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
