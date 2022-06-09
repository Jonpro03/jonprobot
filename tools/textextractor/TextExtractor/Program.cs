namespace TextExtractor
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using System.IO;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;

    using Windows.Globalization;
    using Windows.Graphics.Imaging;
    using Windows.Media.Ocr;

    /// <summary>
    /// Extracts share count from images using Windows 10 (https://blogs.windows.com/windowsdeveloper/2016/02/08/optical-character-recognition-ocr-for-windows-10/)
    /// 
    /// There are two options when running the utility
    ///     TextExtractor.exe {directory} {outputfile}
    ///         This syntax will enumerate through all images in a particular directory, analyze the images, and write results for each successful image to a
    ///         comma-separated file (csv) with the format {fileName},{share count}
    ///     TextExtractor.exe {file name}
    ///         This syntax will allow processing of a single file. Output is written to the console. In the case of an error, the exit code will be non-zero and
    ///         the reason for the failure will be written into the stderr stream.
    /// </summary>
    public static class Program
    {
        // for numbers of format #,###.##
        private static CultureInfo EnCulture = new("en");

        // for numbers of format #.###,##
        private static CultureInfo DeCulture = new("de");

        // for numbers of format # ###,##
        private static CultureInfo SeCulture = new("se");

        /// <summary>
        /// Tries to parse a float using various global number formats
        /// </summary>
        /// <param name="input">The string to parse.</param>
        /// <param name="output">The float.</param>
        /// <returns>A value indicating whether or not the parse was successful.</returns>
        internal static bool TryParseFloat(string input, out float output)
        {
            // #,###.##
            if (float.TryParse(input, NumberStyles.Any, EnCulture, out output))
            {
                return true;
            }

            // #.###,##
            if (float.TryParse(input, NumberStyles.Any, DeCulture, out output))
            {
                return true;
            }

            // # ###,##
            if (float.TryParse(input, NumberStyles.Any, SeCulture, out output))
            {
                return true;
            }

            return false;
        }

        /// <summary>
        /// The meat of the processing.
        ///    1) loads an image
        ///    2) converts it to grayscale (not sure if this is necessary)
        ///    3) extracts text using windows UWP OCR
        ///    4) enumerates line by line and parses floats
        ///    5) does rudimentary logic to determine whether the value is reasonable
        /// </summary>
        /// <param name="fileInfo">File to process</param>
        /// <returns>A tuple with the file name that was processed and the result.</returns>
        private static async Task<(string fileName, float shareCount)> ProcessSingleImageAsync(FileInfo fileInfo)
        {
            Stream fileStream;

            try
            {
                fileStream = File.OpenRead(fileInfo.FullName);
            }
            catch(IOException e)
            {
                WriteError(fileInfo.Name, "Faile to open file for read", e);
                throw;
            }

            using var inputStream = fileStream.AsRandomAccessStream();
            var decoder = await BitmapDecoder.CreateAsync(inputStream);
            using var bitmap = await decoder.GetSoftwareBitmapAsync();

            // convert to 8 bit greyscale
            using var greymap = SoftwareBitmap.Convert(bitmap, BitmapPixelFormat.Gray8);

            var engine = OcrEngine.TryCreateFromLanguage(new Language("en"));
            var ocrResult = await engine.RecognizeAsync(greymap);
            var lines = ocrResult.Lines;
            var candidates = new List<float>();
        
            foreach (var item in lines)
            {
                if (TryParseFloat(item.Text, out var candidate))
                {
                    candidates.Add(candidate);
                }
            }

            candidates = candidates.Distinct().OrderByDescending(f => f).ToList();

            // Eliminate values that are likely incorrect
            for (var i = candidates.Count -1; i >= 0; i--)
            {
                if (candidates[i] > 10000 || candidates[i] < 0)
                {
                    WriteError(fileInfo.Name, $"a share count detected that was likely an OCR error, ignoring the value {candidates[i]}");
                    candidates.RemoveAt(i);
                    continue;
                }
            }

            if (candidates.Count == 1)
            {
                return (fileInfo.Name, candidates[0]);
            }
            else if (candidates.Count == 2)
            {
                if (Math.Floor(candidates[0]) == Math.Floor(candidates[1]))
                {
                    // share count was likely listed twice - once with fractional shares, once without
                    return (fileInfo.Name, candidates[0]);
                }
                else
                {
                    WriteError(fileInfo.Name, $"Could not acccurately determine the share count. Detected values {candidates[0]} and {candidates[1]}");
                }
            }
            else if (candidates.Count > 2)
            {
                WriteError(fileInfo.Name, $"Could not acccurately determine the share count. Detected numerous values in text {ocrResult.Text}");
            }

            WriteError(fileInfo.Name, $"No share count detected in OCR result: \"{ocrResult.Text}\"");
            throw new InvalidOperationException();
        }

        /// <summary>
        /// Displays command line usage.
        /// </summary>
        private static void Usage()
        {
            Console.WriteLine("\r\n\r\nUsage:  ");
            Console.WriteLine("\tTextExtractor.exe <input directory> <output file>");
            Console.WriteLine("\tTextExtractor.exe <input file>");
            Console.WriteLine("Arguments:");
            Console.WriteLine("\tInput Directory: The directory containing the images to examine. supported image types: JPEG, PNG, GIF, TIFF, BMP, ICO, JPEG-XR");
            Console.WriteLine("\tOutput File: The csv file to write the output to. output syntax is <file name>,<share count>");
            Console.WriteLine("\tInput File: Single file processing. Supports the same images types as the input directory argument. Output is written to console.");
            Console.WriteLine("\t\tin the case of failure, the exit code will be non-zero and the reason for the failure should be written to the stderr");
            Environment.Exit(1);
        }

        private static void WriteError(string fileName, string msg, Exception e = null)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                Console.Error.WriteLine($"ERROR: {msg}");
            }
            else
            {
                Console.Error.WriteLine($"ERROR: {fileName} , {msg}");
            }

            if (e != null)
            {
                Console.Error.WriteLine(e);
            }
        }

        private static void WriteErrorAndExit(string fileName, string msg, int exitCode, Exception e = null)
        {
            WriteError(fileName, msg, e);
            Environment.Exit(exitCode);
        }


        private static void ProcessSingleImage(string fileName)
        {
            var fi = new FileInfo(fileName);
            if (!fi.Exists)
            {
                WriteErrorAndExit(fileName, $"The input file does not exist", 1);
            }

            (string fileName, float shareCount) result = default;

            try
            {
                result = ProcessSingleImageAsync(fi).Result;
            }
            catch(InvalidOperationException)
            {
                WriteErrorAndExit(fileName, "Could not process the image file. No share count was detected", 2);
            }
            catch(AggregateException e)
            {
                WriteErrorAndExit(fileName, $"An exception occurred while processing the image.", 3, e);
            }
            catch(Exception e)
            {
                WriteErrorAndExit(fileName, $"An exception occurred while processing the image.", 4, e);
            }

            Console.WriteLine($"{result.Item2}");
            Environment.Exit(0);
        }

        private static void ProcessImages(string directoryName, string outFile)
        {
            string[] supportedImageTypes = { ".jpg", ".gif", ".tiff", ".png", ".ico", ".bmp" };
            if (!Directory.Exists(directoryName))
            {

                WriteError(string.Empty, "The input directory did not exist");
                Usage();
            }

            var files = Directory.GetFiles(directoryName)
                .Select(f => new FileInfo(f))
                .Where(f => supportedImageTypes.Contains(f.Extension, StringComparer.OrdinalIgnoreCase))
                .ToList();

            if (files.Count == 0)
            {
                WriteErrorAndExit(directoryName, "No files in the input directory to process", 5);
            }

            var tasks = files.Select(f => ProcessSingleImageAsync(f)).ToList();
            try
            {
                Task.WaitAll(tasks.ToArray());
            }
            catch
            {
                // individual tasks may fail so ignore the aggregate exception
            }

            try
            {
                using var outfile = File.Open(outFile, FileMode.Create, FileAccess.Write, FileShare.None);
                using var streamWriter = new StreamWriter(outfile, Encoding.ASCII);

                foreach ((string fileName, float shareCount) in tasks.Where(t => t.IsCompletedSuccessfully).Select(t => t.Result))
                {
                    streamWriter.WriteLine($"{fileName},{shareCount}");
                }
            }
            catch (Exception e)
            {
                WriteErrorAndExit(outFile, "An exception occurred when writing the results to the output file", 6, e);
            }


            Console.WriteLine("The images processed. Individual errors, if any, were written to stderr");
            Environment.Exit(0);
        }

        /// <summary>
        /// Entry point
        /// </summary>
        /// <param name="args">The command line arguments.</param>
        public static void Main(string[] args)
        {
            if (args == null || args.Length == 0 || args.Length > 2)
            {
                Usage();
            }

            if (args.Length == 1)
            {
                // in single file mode.
                ProcessSingleImage(args[0]);
            }

            if (args.Length == 2)
            {
                // in batch mode.
                ProcessImages(args[0], args[1]);
            }
        }
    }
}
