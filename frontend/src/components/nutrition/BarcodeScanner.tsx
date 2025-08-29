import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Camera, X, RefreshCw, Edit3 } from 'lucide-react';
import Button from '../ui/Button';
import { useKeyboard } from '../../hooks/useKeyboard';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (barcode: string) => void;
  closeOnOutsideClick?: boolean;
}

export default function BarcodeScanner({ isOpen, onClose, onScanResult, closeOnOutsideClick = true }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onScanResult(manualBarcode.trim());
      setManualBarcode('');
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  useKeyboard({
    onEnter: showManualInput ? handleManualSubmit : undefined,
    onEscape: onClose,
    enabled: isOpen
  });

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      setError(null);
      
      // Vérifier les permissions de caméra
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setHasPermission(permissions.state === 'granted');
      
      if (permissions.state === 'denied') {
        setError('Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
        return;
      }

      // Initialiser le lecteur de code-barres
      codeReader.current = new BrowserMultiFormatReader();
      
      // Démarrer le scan
      await startScanning();
      
    } catch (err) {
      console.error('Erreur lors de l\'initialisation du scanner:', err);
      setError('Impossible d\'accéder à la caméra. Vérifiez que votre appareil dispose d\'une caméra et que les permissions sont accordées.');
    }
  };

  const startScanning = async () => {
    if (!codeReader.current || !videoRef.current) return;

    try {
      setIsScanning(true);
      setError(null);

      // Obtenir les appareils vidéo disponibles
      const videoDevices = await codeReader.current.listVideoInputDevices();
      
      if (videoDevices.length === 0) {
        throw new Error('Aucune caméra détectée');
      }

      // Préférer la caméra arrière pour mobile
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      
      const selectedDevice = backCamera || videoDevices[0];

      // Démarrer le décodage
      const controls = await codeReader.current.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const barcode = result.getText();
            console.log('Code-barres scanné:', barcode);
            onScanResult(barcode);
            stopScanning();
            onClose();
          }
          
          if (error && !(error.name === 'NotFoundException')) {
            console.warn('Erreur de scan:', error);
          }
        }
      );

      // Stocker le stream pour pouvoir l'arrêter plus tard
      if (videoRef.current && videoRef.current.srcObject) {
        streamRef.current = videoRef.current.srcObject as MediaStream;
      }
      
      setHasPermission(true);
      
    } catch (err) {
      console.error('Erreur lors du démarrage du scan:', err);
      setError('Erreur lors du démarrage du scanner. Vérifiez que votre caméra fonctionne correctement.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    try {
      // Arrêter le stream vidéo
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }

      // Arrêter la vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Tenter d'arrêter le codeReader si la méthode existe
      if (codeReader.current) {
        try {
          if (typeof codeReader.current.reset === 'function') {
            codeReader.current.reset();
          }
        } catch (e) {
          // Ignorer les erreurs de reset si la méthode n'existe pas
          console.warn('Reset method not available on codeReader');
        }
      }
    } catch (error) {
      console.warn('Erreur lors de l\'arrêt du scanner:', error);
    }
    
    setIsScanning(false);
  };

  const retry = () => {
    setError(null);
    setShowManualInput(false);
    initializeScanner();
  };

  const toggleManualInput = () => {
    setShowManualInput(!showManualInput);
    setError(null);
    if (!showManualInput) {
      stopScanning();
      setManualBarcode('');
    } else {
      initializeScanner();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            {showManualInput ? 'Saisir un code-barres' : 'Scanner un code-barres'}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleManualInput}
              className="flex items-center"
            >
              {showManualInput ? <Camera className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
              {showManualInput ? 'Scanner' : 'Saisir'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {error && !showManualInput ? (
            <div className="text-center space-y-4">
              <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm">{error}</p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={retry} className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
                <Button onClick={toggleManualInput} variant="outline" className="flex items-center">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Saisir manuellement
                </Button>
              </div>
            </div>
          ) : showManualInput ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Code-barres
                </label>
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Ex: 3245412345678"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="text-center text-slate-600">
                <p className="text-sm">Saisissez le code-barres que vous voyez sur l'emballage</p>
                <p className="text-xs text-slate-500 mt-1">
                  Généralement 8, 13 ou 14 chiffres
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={handleManualSubmit} 
                  disabled={!manualBarcode.trim()}
                  className="flex items-center"
                >
                  Rechercher
                </Button>
                <Button 
                  onClick={toggleManualInput} 
                  variant="outline"
                  className="flex items-center"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Utiliser la caméra
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Zone de scan */}
              <div className="relative bg-slate-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {/* Overlay de visée */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white border-dashed rounded-lg w-64 h-32 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="text-white text-center">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Centrez le code-barres ici</p>
                    </div>
                  </div>
                </div>

                {/* Indicateur de scan */}
                {isScanning && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    Scan en cours...
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center text-slate-600 space-y-2">
                <p className="text-sm">Pointez votre caméra vers un code-barres</p>
                <p className="text-xs text-slate-500">
                  Le scan se fait automatiquement une fois le code détecté
                </p>
              </div>

              {/* Permissions */}
              {hasPermission === false && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Veuillez autoriser l'accès à votre caméra pour scanner les codes-barres.
                  </p>
                  <div className="mt-2">
                    <Button onClick={toggleManualInput} variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Saisir manuellement
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}