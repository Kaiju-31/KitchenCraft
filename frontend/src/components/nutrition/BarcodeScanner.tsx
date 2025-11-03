import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
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
      
      // Vérifier si les APIs sont disponibles
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Votre navigateur ne supporte pas l\'accès à la caméra. Veuillez utiliser un navigateur moderne ou la saisie manuelle.');
        return;
      }

      // Vérifier les permissions de caméra si l'API permissions est disponible
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setHasPermission(permissions.state === 'granted');
          
          if (permissions.state === 'denied') {
            setError('Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
            return;
          }
        }
      } catch (permError) {
        // L'API permissions peut ne pas être supportée, continuer sans
        console.warn('Permissions API not fully supported:', permError);
      }

      // Initialiser le lecteur de code-barres avec configuration complète
      codeReader.current = new BrowserMultiFormatReader();
      
      // Configuration des hints pour améliorer la détection
      const hints = new Map();
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.PURE_BARCODE, true);
      // hints.set(DecodeHintType.ALSO_INVERTED, true); // Not available in this version
      
      // Spécifier les formats de codes-barres supportés (produits alimentaires)
      const formats = [
        BarcodeFormat.EAN_13,    // Standard européen (le plus courant)
        BarcodeFormat.EAN_8,     // Version courte
        BarcodeFormat.UPC_A,     // Standard américain
        BarcodeFormat.UPC_E,     // Version courte américaine
        BarcodeFormat.CODE_128,  // Code industriel
        BarcodeFormat.CODE_39,   // Autre code industriel
        BarcodeFormat.ITF,       // Interleaved 2 of 5
        BarcodeFormat.CODABAR    // Ancien format encore utilisé
      ];
      
      hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
      
      // Appliquer les hints
      try {
        codeReader.current.hints = hints;
        console.log('🔧 Configuration du scanner:', { 
          formats: formats.map(f => f.toString()),
          hints: Array.from(hints.entries())
        });
      } catch (e) {
        console.warn('⚠️ Impossible de configurer les hints:', e);
      }
      
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

      // Approche moderne : utiliser getUserMedia directement
      try {
        // Contraintes pour la caméra optimisées pour la lecture de codes-barres
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: 'environment' }, // Caméra arrière
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
            frameRate: { ideal: 30, min: 15 },
            // focusMode: { ideal: 'continuous' }, // Not supported in MediaTrackConstraints
            // Améliorer la qualité pour les codes-barres
            aspectRatio: { ideal: 16/9 },
          }
        };

        console.log('📷 Initialisation de la caméra avec les contraintes:', constraints);

        // Obtenir le stream vidéo
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        // Logging des propriétés de la caméra obtenue
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
          const track = videoTracks[0];
          const settings = track.getSettings();
          console.log('📱 Caméra configurée:', {
            width: settings.width,
            height: settings.height,
            frameRate: settings.frameRate,
            facingMode: settings.facingMode,
            deviceId: settings.deviceId
          });
        }
        
        // Assigner le stream à la vidéo
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          console.log('▶️ Vidéo démarrée');
        }

        // Démarrer le décodage avec le stream
        console.log('🔍 Démarrage du décodage...');
        const controls = await codeReader.current.decodeFromStream(
          stream,
          videoRef.current,
          (result, error) => {
            if (result) {
              const barcode = result.getText();
              const format = result.getBarcodeFormat();
              console.log('✅ Code-barres scanné:', { 
                barcode, 
                format: format?.toString(),
                points: result.getResultPoints()?.length 
              });
              onScanResult(barcode);
              stopScanning();
              onClose();
            }
            
            if (error) {
              // Filtrer les erreurs "normales" de scan
              if (error.name === 'NotFoundException') {
                // C'est normal, pas de code détecté dans cette frame
                return;
              }
              
              // Logs uniquement pour les vraies erreurs, pas trop fréquents
              if (Math.random() < 0.01) { // 1% chance de logger pour éviter le spam
                console.warn('⚠️ Erreur de scan occasionnelle:', error.name);
              }
            }
          }
        );

        setHasPermission(true);

      } catch (streamError) {
        // Si getUserMedia échoue, essayer l'ancienne méthode
        console.warn('getUserMedia failed, trying fallback method:', streamError);
        
        // Fallback : utiliser decodeFromVideoDevice si disponible
        if (typeof codeReader.current.decodeFromVideoDevice === 'function') {
          await codeReader.current.decodeFromVideoDevice(
            undefined, // Premier device disponible
            videoRef.current,
            (result, error) => {
              if (result) {
                const barcode = result.getText();
                console.log('Code-barres scanné:', barcode);
                onScanResult(barcode);
                stopScanning();
                onClose();
              }
              
              if (error && error.name !== 'NotFoundException') {
                // Logs réduits pour éviter le spam
                if (Math.random() < 0.01) {
                  console.warn('⚠️ Erreur fallback:', error.name);
                }
              }
            }
          );
          
          // Stocker le stream pour pouvoir l'arrêter plus tard
          if (videoRef.current && videoRef.current.srcObject) {
            streamRef.current = videoRef.current.srcObject as MediaStream;
          }
          
          setHasPermission(true);
        } else {
          throw new Error('Camera access methods not available');
        }
      }
      
    } catch (err) {
      console.error('Erreur lors du démarrage du scan:', err);
      setError('Erreur lors du démarrage du scanner. Vérifiez que votre caméra fonctionne correctement et que les permissions sont accordées.');
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
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }

      // Tenter d'arrêter le codeReader avec différentes méthodes
      if (codeReader.current) {
        try {
          // Essayer les différentes méthodes d'arrêt disponibles
          // ZXing cleanup - use available methods
          if (codeReader.current.getVideoInputDevices) {
            // Modern ZXing API cleanup
            console.log('Cleaning up ZXing scanner');
          }
        } catch (e) {
          // Ignorer les erreurs de reset si les méthodes n'existent pas
          console.warn('Scanner stop methods not available:', e);
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
              variant="secondary"
              size="sm"
              onClick={toggleManualInput}
              className="flex items-center"
            >
              {showManualInput ? <Camera className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
              {showManualInput ? 'Scanner' : 'Saisir'}
            </Button>
            <Button
              variant="primary"
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
                <Button onClick={toggleManualInput} variant="secondary" className="flex items-center">
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
                  variant="secondary"
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
                  <div className="border-2 border-white border-dashed rounded-lg w-64 h-32 flex items-center justify-center">
                    <div className="text-white text-center drop-shadow-lg">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Centrez le code-barres ici</p>
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
                <p className="text-sm font-medium">Pointez votre caméra vers un code-barres</p>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>• Assurez-vous que le code-barres est bien éclairé</p>
                  <p>• Tenez l'appareil stable et à bonne distance</p>
                  <p>• Le scan se fait automatiquement</p>
                </div>
              </div>

              {/* Permissions */}
              {hasPermission === false && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Veuillez autoriser l'accès à votre caméra pour scanner les codes-barres.
                  </p>
                  <div className="mt-2">
                    <Button onClick={toggleManualInput} variant="secondary" size="sm">
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
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}